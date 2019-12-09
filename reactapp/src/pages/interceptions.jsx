import React, { Component } from 'react';
import Interceptors from '../components/interceptorsTable';
import Contacts from '../components/contactsTable';
import InterceptorDeployForm from '../components/interceptorsDeploy';

class Interception extends Component {

  state = {
    contacts: [],
    aircrafts: [],
    isDeploying: false,
    contact: undefined,
    interceptor: undefined
  };

  componentDidMount() {
    this.radarSweep = setInterval(() => {
      let data = this.props.aircrafts.filter(aircraft => aircraft.status.destroyed !== true);

      let contacts = data.filter(aircraft => aircraft.team.teamId !== this.props.team._id);
      contacts = contacts.filter(aircraft => aircraft.status.deployed === true);

      let aircrafts = data.filter(aircraft => aircraft.team.teamId === this.props.team._id);;

      this.setState({ contacts, aircrafts });
      // console.log('Contacts and Aircrafts set...');
    }, 500);
  };

  componentWillUnmount() {
    clearInterval(this.radarSweep);
  }

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
          <Contacts 
            deployInterceptors={ this.deployInterceptors }
            contacts={this.state.contacts}
          />
          <hr />
          <Interceptors aircrafts={this.state.aircrafts} />
          { this.state.isDeploying ? <InterceptorDeployForm 
            aircrafts={ this.state.aircrafts }
            deployInterceptors={ this.deployInterceptors }
            handleChange={ this.handleChange }
            interceptor={ this.state.interceptor }
            contact={this.state.contact}
          /> : null }
      </React.Fragment>
    );
  };
}

export default Interception;
