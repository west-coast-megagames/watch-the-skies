import React, { Component } from 'react';
import { connect } from 'react-redux';
import DeployMilitary  from './deployForm';
import InfoAircraft from './infoAircraft';
import InfoDeploy from './infoDeploy';
import InfoMilitary from './infoMilitary';
import InfoSite from './infoSite';

class InfoDrawer extends Component {
	render() { 
		return (
			<React.Fragment>
			{this.props.login && <InfoAircraft />}
			{this.props.login && <InfoDeploy />}
			{this.props.login && <DeployMilitary />}
			{this.props.login && <InfoMilitary />}
			{this.props.login && <InfoSite />}
			</React.Fragment>
		);
	}
}

const mapStateToProps = state => ({
		login: state.auth.login,
		showDeploy: state.info.showDeploy
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(InfoDrawer);