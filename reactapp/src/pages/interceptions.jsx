import React, { Component } from 'react';
import Interceptors from '../components/interceptorsTable';
import Contacts from '../components/contactsTable';
import InterceptorDeployForm from '../components/interceptorsDeploy';

class Interception extends Component {
  state = {
      contacts: [],
      interceptors: [],
      isDeploying: false,
      deployData:{
        contact: null,
        interceptor: null
      }
  };

  async deployInterceptors( context, contact=null, interceptor=null ){
    this.toggleDeploy();

    if ( context === 'cancel' ){
      this.state.deployData.contact = null;
      this.state.deployData.interceptor = null;
      return;
    }
    else if ( context === 'deploying' ){
      this.state.deployData.contact = contact;
    }
    else if ( context === 'deployed' ){
      this.state.deployData.interceptor = interceptor;
    }
  }

  toggleDeploy(){
      this.setState({
        isDeploying: !this.state.isDeploying
      });
  };

  render(){
    return (
        <React.Fragment>
            <h1>Operations Module - Interception Tab</h1>
            <Contacts deployInterceptors={ this.deployInterceptors.bind(this) } />
            <hr />
            <Interceptors />
            { this.state.isDeploying ? <InterceptorDeployForm deployInterceptors={ this.deployInterceptors.bind(this) } /> : null }
        </React.Fragment>
    );
  };
}

export default Interception;
