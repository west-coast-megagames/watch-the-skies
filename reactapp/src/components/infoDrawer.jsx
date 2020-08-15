import React, { Component } from 'react';
import { connect } from 'react-redux';
import InfoAircraft from './infoAircraft';
import InfoDeploy from './infoDeploy';
import InfoMilitary from './infoMilitary';


class InfoDrawer extends Component {
    render() { 
        return (
            <React.Fragment>
                {this.props.login && <InfoAircraft />}
                {this.props.login && <InfoDeploy />}
                {this.props.login && <InfoMilitary />}
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => ({
    login: state.auth.login
    
  });
  
  const mapDispatchToProps = dispatch => ({});
  
export default connect(mapStateToProps, mapDispatchToProps)(InfoDrawer);