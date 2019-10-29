import React, { Component } from 'react';
import Interceptors from '../components/interceptorsTable';
import Contacts from '../components/contactsTable';
import InterceptorDeployForm from '../components/interceptorsDeploy';

class Interception extends Component {
  state = {
      contacts: [],
      interceptors: [],
      isDeploying: false
  };

  async toggleDeploy(){
      this.setState({
        isDeploying: !this.state.isDeploying
      });
  };

  render(){
    return (
        <React.Fragment>
            <h1>Operations Module - Interception Tab</h1>
            <Contacts />
            <hr />
            <Interceptors />
            { this.state.isDeploying ? <InterceptorDeployForm doneDeploying={this.toggleDeploy.bind(this) } /> : null }
        </React.Fragment>
    );
  };
}

export default Interception;
