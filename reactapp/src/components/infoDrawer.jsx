import React, { Component } from 'react';
import { connect } from 'react-redux';
import DeployMilitary  from './deployForm';
import InfoAircraft from './infoAircraft';
import InfoDeploy from './infoDeploy';
import InfoMilitary from './infoMilitary';
import InfoSite from './infoSite';

class InfoDrawer extends Component {
	render() {
		const { team } = this.props.auth;
		return (
			<React.Fragment>
			{ this.props.login && team && <InfoAircraft /> }
			{ this.props.login && team && <InfoDeploy /> }
			{ this.props.login && team && <DeployMilitary /> }
			{ this.props.login && team && <InfoMilitary /> }
			{ this.props.login && team && <InfoSite /> }
			</React.Fragment>
		);
	}
}

const mapStateToProps = state => ({
		login: state.auth.login,
		auth: state.auth,
		showDeploy: state.info.showDeploy
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(InfoDrawer);