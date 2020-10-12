import React from 'react';
import { connect } from 'react-redux'; // Redux store provider
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { formatRelative } from 'date-fns';

import { mapKey } from '../../../config';
import mapStyle from './mapStyles';
import { Alert } from 'rsuite';
import { targetAssigned } from '../../../store/entities/infoPanels';
import { getCities } from '../../../store/entities/sites';

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

function PrototypeMap(props) {
	const { isLoaded, loadError } = useLoadScript({
		googleMapsApiKey: mapKey,
		libraries
	});

	const [markers, setMarkers] = React.useState([]);
	const [selected, setSelected] = React.useState(null);

	const onMapClick = React.useCallback((event) => {
		setMarkers(current => [...current, {
			lat: event.latLng.lat(),
			lng: event.latLng.lng(),
			time: new Date
		}])
	}, []);

	const mapRef = React.useRef();
	const onMapLoad = React.useCallback((map) => {
		mapRef.current = map;
	}, []);
	
	if (loadError) return 'Error loading maps'
	if (!isLoaded) return 'Loading map'
	return (
		<GoogleMap
			mapContainerStyle={mapContainerStyle}
			zoom={8}
			center={center}
			options={options}
			onClick={onMapClick}
			onLoad={onMapLoad}
		>
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
				{props.cities.map(city =>
					<Marker
						key={city._id}
						position={{ lat: city.geoDecimal.latDecimal, lng: city.geoDecimal.longDecimal }}
						onClick={()=> {
							Alert.error('Target has no timestamp!', 400)
							props.assignTarget(city)
						}}
					/>)}
				{ selected && !selected.time ? Alert.error('Target has no timestamp!', 400) : null}
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
	cities: getCities(state)
});

const mapDispatchToProps = dispatch => ({
  assignTarget: (payload) => dispatch(targetAssigned(payload))
});
  
export default connect(mapStateToProps, mapDispatchToProps)(PrototypeMap);