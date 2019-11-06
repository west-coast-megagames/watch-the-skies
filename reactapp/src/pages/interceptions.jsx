import React, { Component } from 'react';
import Interceptors from '../components/interceptorsTable';
import Contacts from '../components/contactsTable';
import InterceptorDeployForm from '../components/interceptorsDeploy';

class Interception extends Component {

  state = {
      contacts: [],
      interceptors: [],
      isDeploying: false,
      contact: undefined,
      interceptor: undefined
      };

  deployInterceptors = async (context, contact, interceptor) =>{
    this.toggleDeploy();

    if ( context === 'cancel' ){
      this.setState({
        contact: undefined,
        interceptor: undefined
      });
      return;
    } else if ( context === 'deploying' ){
      this.setState({
        contact
      });
    } else if ( context === 'deployed' ){
      this.setState({
        interceptor
      });
      //do something to update database and change table states
    }
  };

  toggleDeploy = () => {
      this.setState({
        isDeploying: !this.state.isDeploying
      });
  };

  render(){
    return (
        <React.Fragment>
            <h1>Operations Module - Interception Tab</h1>
            <Contacts deployInterceptors={ this.deployInterceptors } />
            <hr />
            <Interceptors />
            { this.state.isDeploying ? <InterceptorDeployForm deployInterceptors={ this.deployInterceptors } handleChange={ this.handleChange } interceptor={ this.state.interceptor } contact={this.state.contact}/> : null }
        </React.Fragment>
    );
  };
}

export default Interception;
