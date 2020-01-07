import React, { Component } from 'react';
import Interceptors from '../../components/interceptorsTable';
import Contacts from '../../components/contactsTable';
import InterceptorDeployForm from '../../components/interceptorsDeploy';
import InterceptorInfo from '../../components/interceptorInfo';

class Interception extends Component {

  state = {
    contacts: [],
    aircrafts: [],
    isDeploying: false,
    contact: undefined,
    showInfo: false,
    interceptor: undefined
  };

  componentDidMount() {
    this.radarSweep = setInterval(() => {
      let data = this.props.aircrafts.filter(aircraft => aircraft.status.destroyed !== true);

      let contacts = data.filter(aircraft => aircraft.team.team_id !== this.props.team._id);
      contacts = contacts.filter(aircraft => aircraft.status.deployed === true);

      let aircrafts = data.filter(aircraft => aircraft.team.team_id === this.props.team._id);

      this.setState({ contacts, aircrafts });
      // console.log('Contacts and Aircrafts set...');
    }, 500);
  };

  componentWillUnmount() {
    clearInterval(this.radarSweep);
  };

  render(){
    return (
      <React.Fragment>
          <Contacts 
            deployInterceptors={ this.deployInterceptors }
            contacts={this.state.contacts}
          />
          <hr />
          <Interceptors
            aircrafts={this.state.aircrafts}
            onClick={ this.showInfo }
          />

          { this.state.showInfo ? <InterceptorInfo
            interceptor={ this.state.interceptor }
            onClick={ this.showInfo }
            alert={ this.props.alert }
            /> : null }

          { this.state.isDeploying ? <InterceptorDeployForm 
            aircrafts={ this.state.aircrafts }
            deployInterceptors={ this.deployInterceptors }
            handleChange={ this.handleChange }
            interceptor={ this.state.interceptor }
            contact={this.state.contact}
            alert={ this.props.alert } 
          /> : null }
      </React.Fragment>
    );
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
    }
  };

  showInfo = async (context, interceptor) =>{
    this.setState({
      showInfo: !this.state.showInfo
    });

    if ( context === 'cancel' ){
      this.setState({
        interceptor: undefined
      });
      return;
    } else if ( context === 'info' ){
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

}

export default Interception;
