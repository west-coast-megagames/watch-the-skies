import React, { Component } from 'react';
import { Alert, Icon, IconButton } from 'rsuite';
import { connect } from 'react-redux';
import { infoRequested, showSite, targetAssigned } from '../../store/entities/infoPanels';

const menu = {
	display: 'inline-block',
	position: 'absolute',
}

class OpsMenu extends Component {
	state = {}
	render() { 
		console.log(this.props.info)
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
						borderRadius: '50%',
						border: '2px solid black'
						}}>
					<IconButton icon={<Icon icon="close" />} size="sm" color="red" circle 
						style={{...menu, top: '33px', left: '33px'}}
						onClick={() => this.props.closeMenu()}
					/>
					<IconButton icon={<Icon icon='info-circle' />} size="md" appearance='link' onClick={() => this.props.info.model === 'Site' ? this.props.showSite(this.props.info) : this.props.info.model === 'Aircraft' ? this.props.showAircraft(this.props.info) : Alert.info(`Latitude: ${this.props.info.lat}\nLongitude: ${this.props.info.lng}`)} style={{...menu, top: '1px', left:'30px'}} />
					<IconButton icon={<Icon icon='fighter-jet' />} size="md" appearance='link' onClick={() => this.props.info.type != undefined ? this.props.assignTarget(this.props.info) : Alert.warning(`You can only deploy to a site currently!`)} style={{...menu, left: '1px', top:'30px'}} />
					<IconButton icon={<Icon icon='eye' />} size="md" appearance='link' onClick={() => Alert.warning('Assigning a Recon mission is not possible yet..')} style={{...menu, right: '1px', top:'30px'}} />
					<IconButton icon={<Icon icon='crosshairs' />} size="md" appearance='link' onClick={() => Alert.warning('Deploying troops is not possible yet..')} style={{...menu, bottom: '1px', left:'30px'}} />
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
	showAircraft: (payload) => dispatch(infoRequested(payload)),
	assignTarget: (payload) => dispatch(targetAssigned(payload))
});

export default connect(mapStateToProps, mapDispatchToProps)(OpsMenu);