import React from 'react';
import { connect } from 'react-redux'; // Redux store provider
import { GoogleMap, useLoadScript, Marker, MarkerClusterer, InfoWindow, OverlayView } from '@react-google-maps/api';
import { formatRelative } from 'date-fns';

import { mapKey } from '../../../config';
import mapStyle from './mapStyles';
import { Alert } from 'rsuite';
import { targetAssigned } from '../../../store/entities/infoPanels';
import { getCities } from '../../../store/entities/sites';
import OpsMenu from '../../../components/common/menuOps';
import { getContacts } from '../../../store/entities/aircrafts';
import getFlag from '../../../scripts/teamFlags';

const libraries = ['places'];
const mapContainerStyle = {
	width: '94.5%',
	height: '92%',
	position: 'absolute'
};

const center = {
	lat: 43.653225,
	lng: -79.383186
};

const options = {
	styles: mapStyle,
	disableDefaultUI: true,
	zoomControl: true,
	mapTypeId: 'terrain'
}

const clusterOptions = {
  imagePath:
    'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m', // so you must have m1.png, m2.png, m3.png, m4.png, m5.png and m6.png in that folder
}

function PrototypeMap(props) {
	const { isLoaded, loadError } = useLoadScript({
		googleMapsApiKey: mapKey,
		libraries
	});

	const [markers, setMarkers] = React.useState([]);
	const [menu, setMenu] = React.useState(null);
	const [geo, setGeo] = React.useState(null);
	const [mapClick, setMapClick] = React.useState({event: undefined})
	const [selected, setSelected] = React.useState(null);

	const onMapClick = React.useCallback((event) => {
		// setMenu({
		// 		lat: event.latLng.lat(),
		// 		lng: event.latLng.lng()
		// })
		setMarkers(current => [...current, {
			lat: event.latLng.lat(),
			lng: event.latLng.lng(),
			time: new Date
		}])
	}, []);

	const onCloseMenu = () => {
		console.log('Closing the menu!')
		setMapClick({event: onMapClick});
		setMenu(null);
	}

	const mapRef = React.useRef();
	const onMapLoad = React.useCallback((map) => {
		setMapClick({event: onMapClick})
		mapRef.current = map;
	}, []);
	
	if (loadError) return 'Error loading maps'
	if (!isLoaded) return 'Loading map'
	return (
		<GoogleMap
			mapContainerStyle={mapContainerStyle}
			zoom={4}
			center={center}
			options={options}
			onClick={mapClick.event}
			onLoad={onMapLoad}
		>
			{menu && <OverlayView position={{lat: geo.latDecimal, lng: geo.longDecimal}} mapPaneName='floatPane'>
				<OpsMenu info={menu} closeMenu={onCloseMenu} />
			</OverlayView>}
			{ props.contacts.map(contact =>
					<Marker
						key={contact._id}
						position={contact.location}
						onClick={()=> {
							setGeo({latDecimal: contact.location.lat, longDecimal: contact.location.lng});
							setMenu(contact);
							setMapClick({event: undefined});
						}}
						icon={{
							url: getFlag(contact.team.code),
							scaledSize: new window.google.maps.Size(20, 20),
							origin: new window.google.maps.Point(0,0),
							anchor: new window.google.maps.Point(10, 10)
						}}		
					/>)
				}
			{markers.map(marker =>
				<Marker
					key={marker.time.toISOString()}
					position={{ lat: marker.lat, lng: marker.lng }}
					onClick={()=> {
						setSelected(marker);
					}}
					icon={{
						url: 'https://upload-icon.s3.us-east-2.amazonaws.com/uploads/icons/png/5506450561579004502-512.png',
						scaledSize: new window.google.maps.Size(30, 30),
						origin: new window.google.maps.Point(0,0),
						anchor: new window.google.maps.Point(10, 10)
					}}
				/>)}
			<MarkerClusterer options={clusterOptions}>
				{(clusterer) => props.cities.map(city =>
					<Marker
						key={city._id}
						clusterer={clusterer}
						position={{ lat: city.geoDecimal.latDecimal, lng: city.geoDecimal.longDecimal }}
						onClick={()=> {
							setGeo(city.geoDecimal)
							setMenu(city);
							setMapClick({event: undefined});
						}}
					/>)
				}
			</MarkerClusterer>
				{selected && !selected.time ? Alert.error('Target has no timestamp!', 400) : null}
				{selected && selected.time ? (<InfoWindow 
					position={{lat: selected.lat, lng: selected.lng}}
					onCloseClick={() => {
						setSelected(null);
				}}>
					<div>
						<h2>Alien Spotted</h2>
						<p>Spotted {formatRelative(selected.time, new Date())}</p>
					</div>
				</InfoWindow>) : null}
		</GoogleMap>
	);
}

const mapStateToProps = state => ({
  login: state.auth.login,
  lastFetch: state.entities.aircrafts.lastFetch,
  team: state.auth.team,
  zones: state.entities.zones.list,
  sites: state.entities.sites.list,
	military: state.entities.military.list,
	contacts: getContacts(state),
	cities: getCities(state)
});

const mapDispatchToProps = dispatch => ({
  assignTarget: (payload) => dispatch(targetAssigned(payload))
});
  
export default connect(mapStateToProps, mapDispatchToProps)(PrototypeMap);