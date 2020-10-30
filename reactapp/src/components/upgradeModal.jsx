import React, { Component } from 'react';
import { connect } from 'react-redux'; // Redux store provider
import { Alert, Drawer, SelectPicker, CheckPicker, Divider, Toggle, Tag, Button } from 'rsuite';
import { getCities, getBases } from "../store/entities/sites";
import { gameServer } from '../config';
import axios from 'axios';

class UpgradeModal extends Component {
	state = {  }
	render() { 
		return ( 
			<Drawer 
				size='sm'  
				placement='right' 
				show={this.props.show} 
				onHide={() => this.props.closeUpgrade()}>
			<Drawer.Header>
					<Drawer.Title>Military Deployment</Drawer.Title>
			</Drawer.Header>
			<Drawer.Body>
					<h6>Select Team</h6>

			</Drawer.Body>
			<Drawer.Footer>
			</Drawer.Footer>
	</Drawer>
		 );
	}
}
 
const mapStateToProps = state => ({
	login: state.auth.login,
	team: state.auth.team,
	sites: state.entities.sites.list,
	military: state.entities.military.list,
	aircraft: state.entities.aircrafts.list,
	citySites: getCities(state),
	// baseSites: getBases(state)
	});
	
const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(UpgradeModal);