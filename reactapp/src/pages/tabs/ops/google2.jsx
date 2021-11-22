import React, { useEffect} from 'react';
import { connect } from 'react-redux'; // Redux store provider
import { GoogleMap, useLoadScript, Marker, MarkerClusterer, InfoWindow, OverlayView, Polyline, Circle } from '@react-google-maps/api';
import { formatRelative } from 'date-fns';

import { mapKey } from '../../../config';
import mapStyle from './mapStyles';
import { Alert, Button } from 'rsuite';
import { showLaunch } from '../../../store/entities/infoPanels';
import { getCities, getGround, getPoI, getCrash, getCapitol, getSatellites } from '../../../store/entities/sites';
import OpsMenu from '../../../components/common/menuOps';
import { getContacts } from '../../../store/entities/aircrafts';
import {getMapIcon, getAircraftIcon, getMilitaryIcon, getSatIcon} from '../../../scripts/mapIcons';
import { getDeployed, getMobilized } from '../../../store/entities/military';
import socket from '../../../socket';
import { getMyTeam } from '../../../store/entities/teams';
import Menu from '../../map/MenuSvg';

const libraries = ['places'];
const mapContainerStyle = {
	width: '94.5%',
	height: '90%',
	position: 'absolute'
};

const options = {
	styles: mapStyle,
	disableDefaultUI: true,
	zoomControl: true,
	minZoom: 3, 
	maxZoom: 8, 
	mapTypeId: 'terrain'
}

const clusterOptions = {
  imagePath:
    'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m', // so you must have m1.png, m2.png, m3.png, m4.png, m5.png and m6.png in that folder
}


// Scott's TODO: add in modal "interrupt for VERY important messages"
function PrototypeMap(props) {
	const { isLoaded, loadError } =  useLoadScript ({
		googleMapsApiKey: mapKey,
		libraries
	});
	// const [markers, setMarkers] = React.useState([]);
	const [menu, setMenu] = React.useState(null);
	const [geo, setGeo] = React.useState(null);
	// const [mapClick, setMapClick] = React.useState({event: undefined})
	const [selected, setSelected] = React.useState(null);
	const [sites, setSites] = React.useState([ ...props.groundSites ]);
	const [contacts, setContacts] = React.useState([ ...props.contacts ]);
	const [military, setMilitary] = React.useState([ ...props.military ]);
	
	const [dragGeo, setDragGeo] = React.useState(null);

	// const onMapClick = React.useCallback((event) => {props.center
	// 	setMenu({
	// 			lat: event.latLng.lat(),
	// 			lng: event.latLng.lng()
	// 	})
	// 	setMarkers(current => [...current, {
	// 		lat: event.latLng.lat(),
	// 		lng: event.latLng.lng(),
	// 		time: new Date
	// 	}])
	// }, []);

	useEffect(() => {
		const site = props.groundSites ? props.groundSites.find(el => el.geoDecimal.lat === props.center.lat && el.geoDecimal.lng === props.center.lng ) : undefined;
		//console.log(site)
		if (site) {
			setGeo(site.geoDecimal);
			// setMenu(site);
		}
	}, [props.center]);

	useEffect(() => { // props.display.some(el => el !== site.subType)
		let sites = [ ...props.groundSites ];
		let contacts = [ ...props.contacts ];
		let military = [ ...props.military ];
		if (!props.display.some(el => el === 'sites')) {
			sites = sites.filter(site => props.display.some(el => el === site.subType));
		}
		if (!props.display.some(el => el === 'contacts')) {
			// todo hook this up
		}
		if (!props.display.some(el => el === 'military')) {

			if (!props.display.some(el => el === 'deployed')) {
				military = military.filter(military => military.status.some(el => el === 'deployed'));
			}
			if (!props.display.some(el => el === 'undeployed')) {
				military = military.filter(military => !military.status.some(el => el === 'deployed'));
			}
		}

		setSites(sites);
		setContacts(contacts);
		setMilitary(military);
	}, [props.display, props.sites, props.military, props.contacts]);

	const onCloseMenu = () => {
		// console.log('Closing the menu!')
		// setMapClick({event: onMapClick});
		setMenu(null);
	}

	const handleOnDragEnd = (data, sat) => {
		// setDragGeo({ id: sat._id, geoDecimal: data.latLng.toJSON()})
		socket.emit('request', { route: 'site', action: 'space', actionType: 'geoPosition', data: { _id: sat._id, geoPosition: data.latLng.toJSON() }});
	}

	const handlenDrag = (data) => {
		console.log(dragGeo)
	}

	const mapRef = React.useRef();
	const onMapLoad = React.useCallback((map) => {
		// setMapClick({event: onMapClick})
		mapRef.current = map;
	}, []);
	
	if (loadError) return 'Error loading maps'
	if (!isLoaded) return 'Loading map'
	return (
		<GoogleMap
			mapContainerStyle={mapContainerStyle}
			zoom={6}
			center={props.center}
			options={options}
			onLoad={onMapLoad}>
			{menu && <OverlayView position={{lat: geo.lat, lng: geo.lng}} mapPaneName='floatPane'>
				<OpsMenu setCenter={props.setCenter} info={menu} closeMenu={onCloseMenu} />
			</OverlayView>}

			{/* The site clusterer... */}
			{<MarkerClusterer options={clusterOptions}
			styles={[
				{
					url: "Arrays start at zero",
					height: 56,
					width: 55,
				},
				{
					url: "https://i.imgur.com/h2t00jl.png",
					height: 56,
					width: 55,
					position: 'absolute',
					left: '100px',
					top: '100px'
				},
				{
					url: "https://i.imgur.com/Cn8zTPb.png",
					height: 62,
					width: 63,
					position: 'absolute',
					left: '100px',
					top: '100px'
				},
			]}
			>
				
			{/*The Marker*/}
			{(clusterer) => sites.map(site => 
				<Marker
					title={site.name}
					key={site._id}
					clusterer={clusterer}
					position={{ lat: site.geoDecimal.lat, lng: site.geoDecimal.lng }}
					onClick={()=> {
						setGeo(site.geoDecimal)
						setMenu(site);
						// setMapClick({event: undefined});
					}}
					icon={{
						url: getMapIcon(site),
						scaledSize: new window.google.maps.Size(55, 55),
						anchor: new window.google.maps.Point(27, 27)
					}}
				>

					{geo === site.geoDecimal && <div>
						<Circle
    				  // required
    				  center={site.geoDecimal}
    				  // required
    				  options={{
								strokeColor: '#ffffff',
								strokeOpacity: 0.8,
								strokeWeight: 2,
								fillColor: '#ffffff',
								fillOpacity: 0.15,
								clickable: false,
								draggable: false,
								editable: false,
								visible: true,
								radius: 30000,
								zIndex: 1
							}}
    				/>
					</div>}

				</Marker>
			)}
			</MarkerClusterer>}

			{/* The Satellite clusterer... */}
			{props.display.some(el => el === 'Satellite') && <MarkerClusterer options={clusterOptions}
			styles={[
				{
					url: "Arrays start at zero",
					height: 56,
					width: 55,
				},
				{
					url: "https://i.imgur.com/h2t00jl.png",
					height: 56,
					width: 55,
					position: 'absolute',
					left: '100px',
					top: '100px'
				},
				{
					url: "https://i.imgur.com/Cn8zTPb.png",
					height: 62,
					width: 63,
					position: 'absolute',
					left: '100px',
					top: '100px'
				},
			]}
			>
			{(clusterer) => props.satellites.map(satellite => 
				<Marker
					title={satellite.name}
					key={satellite._id}
					clusterer={clusterer}
					position={{ lat: satellite.geoDecimal.lat, lng: satellite.geoDecimal.lng }}
					draggable={(satellite.team._id === props.team._id)}
					onDragEnd={(data) => handleOnDragEnd(data, satellite)}
					onClick={()=> {
						setGeo(satellite.geoDecimal)
						setMenu(satellite);
						// setMapClick({event: undefined});
					}}
					icon={{
						url: getSatIcon(satellite.team.code),
						scaledSize: new window.google.maps.Size(55, 55),
						origin: new window.google.maps.Point(0,0),
						anchor: new window.google.maps.Point(10, 10)
					}}
				>

					{geo === satellite.geoDecimal && <div>
						<Circle
    				  // required
    				  center={satellite.geoDecimal}
    				  // required
    				  options={{
								strokeColor: '#ffffff',
								strokeOpacity: 0.8,
								strokeWeight: 2,
								fillColor: '#ffffff',
								fillOpacity: 0.15,
								clickable: false,
								draggable: false,
								editable: false,
								visible: true,
								radius: 30000,
								zIndex: 1
							}}
    				/>
					</div>}

					{(satellite.team._id === props.team._id || satellite.code === 'ISS') && <div>
						<Circle
    				  // required
    				  center={ (dragGeo && dragGeo.id === satellite._id) ? dragGeo.geoDecimal :  satellite.geoDecimal}
    				  // required
    				  options={{
								strokeColor: '#61ff00',
								strokeOpacity: 0.8,
								strokeWeight: 2,
								fillColor: '#61ff00',
								fillOpacity: 0.15,
								clickable: false,
								draggable: false,
								editable: false,
								visible: true,
								radius: 2000000,
								zIndex: 1
							}}
    				/>
					</div>}
				</Marker>
			)}
			</MarkerClusterer>}

			{/*The Contact Clusterer*/}
			{<MarkerClusterer options={clusterOptions}
				styles={[
				{
					url: "XD",
					height: 56,
					width: 55,
				},
				{
					url: "https://i.imgur.com/x7nIvRx.png",
					height: 53,
					width: 53,
					textColor: 'white',
					position: 'absolute',
					right: '100px',
					bottom: '100px'
				},
				{
					url: "https://i.imgur.com/IEfm6Gj.png",
					height: 55,
					width: 56,
					textColor: 'white'
				},
				{
					url: "https://i.imgur.com/R3yqwbI.png",
					height: 60,
					width: 61,
					textColor: 'white'
				},
				]}
				>
				{(clusterer) => contacts.map(contact => 
					<Marker
						title={contact.name}
						key={contact._id}
						clusterer={clusterer}
						position={contact.location}
						onClick={()=> {
							setGeo(contact.location)
							setMenu(contact);
							// setMapClick({event: undefined});
						}}
						icon={{
							url: getAircraftIcon(contact.team.code),
							scaledSize: new window.google.maps.Size(65, 65),
							origin: new window.google.maps.Point(0,0),
							anchor: new window.google.maps.Point(10, 10)
						}}
					>
						{geo === contact.location && <div>
						<Circle
    				  // required
    				  center={contact.location}
    				  // required
    				  options={{
								strokeColor: '#ffffff',
								strokeOpacity: 0.8,
								strokeWeight: 2,
								fillColor: '#ffffff',
								fillOpacity: 0.15,
								clickable: false,
								draggable: false,
								editable: false,
								visible: true,
								radius: 30000,
								zIndex: 1
							}}
    				/>
					</div>}
					</Marker>)}
			</MarkerClusterer>}

			{/*The Military Clusterer*/}
			{<MarkerClusterer options={clusterOptions}>
				{(clusterer) => military.map(unit => 
					<Marker
						title={unit.name}
						key={unit._id}
						clusterer={clusterer}
						position={unit.location}
						onClick={()=> {
							setGeo(unit.location)
							setMenu(unit);
							// setMapClick({event: undefined});
						}}
						icon={{
							url: getMilitaryIcon(unit),
							scaledSize: new window.google.maps.Size(70, 70),
							origin: new window.google.maps.Point(0,0),
							anchor: new window.google.maps.Point(35, 35)
						}}
					>
					<Polyline
   				   path={[
							unit.location,
							unit.site.geoDecimal,
						]}
   				   options={{
							strokeColor: '#61ff00',
							strokeOpacity: 0.8,
							strokeWeight: 2,
							fillColor: '#61ff00',
							fillOpacity: 0.35,
							clickable: false,
							draggable: false,
							editable: false,
							visible: true,
							radius: 30000,
							paths: [
								{lat: 37.772, lng: -122.214},
								{lat: 21.291, lng: -157.821},
								{lat: -18.142, lng: 178.431},
								{lat: -27.467, lng: 153.027}
							],
							zIndex: 1
						}}
   				 />
						{geo === unit.location && <div>
						<Circle
    				  // required
    				  center={unit.location}
    				  // required
    				  options={{
								strokeColor: '#ffffff',
								strokeOpacity: 0.8,
								strokeWeight: 2,
								fillColor: '#ffffff',
								fillOpacity: 0.15,
								clickable: false,
								draggable: false,
								editable: false,
								visible: true,
								radius: 30000,
								zIndex: 1
							}}
    				/>
					</div>}
					</Marker>
					)}
			</MarkerClusterer>}

			{/*The Intel Clusterer*/}
			 {/* {props.intelBoolean && <MarkerClusterer options={clusterOptions}>
				{(clusterer) => props.intel.map(intel => 
					<Marker
						key={intel._id}
						clusterer={clusterer}
						position={intel.document.location}
						onClick={()=> {
							setGeo({lat: intel.document.location.lat, lng: intel.document.location.lng})
							setMenu(intel.document);
							// setMapClick({event: undefined});
						}}
						icon={{
							url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Bananas.svg/1280px-Bananas.svg.png',
							scaledSize: new window.google.maps.Size(65, 65),
							origin: new window.google.maps.Point(0,0),
							anchor: new window.google.maps.Point(10, 10)
						}}
					/>)}
			</MarkerClusterer>} */}


			
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

const mapStateToProps = (state, props) => ({
  login: state.auth.login,
  lastFetch: state.entities.aircrafts.lastFetch,
  team: getMyTeam(state),
  zones: state.entities.zones.list,
  sites: state.entities.sites.list,
	military: state.entities.military.list,
	deployedMil: getDeployed(state),
	mobilizedMil: getMobilized(state),
	contacts: getContacts(state),
	cities:  getCities(state),
	groundSites: getGround(state),
	satellites: getSatellites(state),
	crashes: getCrash(state),
	poi: getPoI(state),

	intel: state.entities.intel.list,
});

const mapDispatchToProps = dispatch => ({
  assignTarget: (payload) => dispatch(showLaunch(payload))
});
  
export default connect(mapStateToProps, mapDispatchToProps)(PrototypeMap);