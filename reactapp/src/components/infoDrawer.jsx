import React, { Component } from 'react';
import { connect } from 'react-redux';
import InfoAircraft from './infoAircraft';
import InfoDeploy from './infoDeploy';


class InfoDrawer extends Component {
    render() { 
        return (
            <React.Fragment>
                {this.props.login && <InfoAircraft />}
                {this.props.login && <InfoDeploy />}
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => ({
    login: state.auth.login
    
  });
  
  const mapDispatchToProps = dispatch => ({});
  
export default connect(mapStateToProps, mapDispatchToProps)(InfoDrawer);