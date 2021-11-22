import React, { Component } from 'react';
import { Alert, Icon, IconButton } from 'rsuite';
import { connect } from 'react-redux';
import { showAircraft, showSite, showLaunch, showDeploy, showMilitary } from '../../store/entities/infoPanels';
import MenuSvg from '../../pages/map/MenuSvg';

const menu = {
	display: 'inline-block',
	position: 'absolute',
}

const OpsMenu = (props) => {

	const assignAir = () => {
		props.assignTarget(props.info);
		props.closeMenu();
	}

	const deployMilitary = () =>  {
		props.deploy(props.info)
		props.closeMenu();
	}

	const handleInfo = () => {
		props.setCenter(props.info._id);
		switch (props.info.model) {
			case 'Site': 
				props.showSite(props.info);
				break;
			case 'Aircraft':
				props.showAircraft(props.info);
				break;
			case 'Military':
				props.showMilitary(props.info);
				break;
			default:
				Alert.info(`Latitude: ${props.info.lat}\nLongitude: ${props.info.lng}`)
		}
		props.closeMenu();
	}

	return (
		<React.Fragment>
			<MenuSvg disabledLeft={props.info.type === 'Space' || props.info.type === 'Fleet' || props.info.type === 'Corps'} disabledRight={props.info.type === 'Aircraft' || props.info.type === 'Space'} handleInfo={handleInfo} closeMenu={() => props.closeMenu} assignAir={assignAir} agentAssign={() => Alert.warning('Assigning an Agent mission is not possible yet..')} deployMilitary={deployMilitary}/>
		</React.Fragment>
		);
	
}

const mapStateToProps = state => ({
	login: state.auth.login
});

const mapDispatchToProps = dispatch => ({
	showSite: (payload) => dispatch(showSite(payload)),
	showAircraft: (payload) => dispatch(showAircraft(payload)),
	showMilitary: (payload) => dispatch(showMilitary(payload)),
	assignTarget: (payload) => dispatch(showLaunch(payload)),
	deploy: (payload) => dispatch(showDeploy(payload))
});

export default connect(mapStateToProps, mapDispatchToProps)(OpsMenu);