import React, { Component } from 'react';
import { Alert, Icon, IconButton } from 'rsuite';
import { connect } from 'react-redux';
import { showAircraft, showSite, showLaunch, showDeploy, showMilitary } from '../../store/entities/infoPanels';

const menu = {
	display: 'inline-block',
	position: 'absolute',
}

class OpsMenu extends Component {
	state = {}

	assign() {
		this.props.assignTarget(this.props.info);
		this.props.closeMenu();
	}

	deployMilitary() {
		this.props.deploy(this.props.info)
		this.props.closeMenu();
	}

	handleInfo = () => {
		//console.log(this.props.info.model)
		switch (this.props.info.model) {
			case 'Site': 
				this.props.showSite(this.props.info);
				break;
			case 'Aircraft':
				this.props.showAircraft(this.props.info);
				break;
			case 'Military':
				this.props.showMilitary(this.props.info);
				break;
			default:
				Alert.info(`Latitude: ${this.props.info.lat}\nLongitude: ${this.props.info.lng}`)
		}
		this.props.closeMenu();
	}

	render() { 
		return (
			<React.Fragment>
				<div className="menu" id="menu"
					style={{
						display: 'grid', 
						background: '#fff',
						height: '100px',
						width: '100px',
						borderRadius: '50%',
						position: 'absolute',
						top: 0,
						left: '-50px',
						bottom: 0,
						margin: 'auto',
						textAlign: 'center',
						border: '2px solid black'
						}}>
					<IconButton icon={<Icon icon="close" />} size="sm" color="red" circle 
						style={{...menu, top: '33px', left: '33px'}}
						onClick={() => this.props.closeMenu()}
					/>
					<IconButton icon={<Icon icon='info-circle' />} size="md" appearance='link' onClick={() => this.handleInfo()} style={{...menu, top: '1px', left:'30px'}} />
					<IconButton icon={<Icon icon='fighter-jet' />} size="md" appearance='link' onClick={() => this.props.info.type !== undefined ? this.assign() : Alert.warning(`You can only deploy to a site currently!`)} style={{...menu, left: '1px', top:'30px'}} />
					<IconButton icon={<Icon icon='eye' />} size="md" appearance='link' onClick={() => Alert.warning('Assigning an Agent mission is not possible yet..')} style={{...menu, right: '1px', top:'30px'}} />
					<IconButton icon={<Icon icon='crosshairs' />} size="md" appearance='link' onClick={() => this.deployMilitary()} style={{...menu, bottom: '1px', left:'30px'}} />
				</div>
			</React.Fragment>
		);
	}
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