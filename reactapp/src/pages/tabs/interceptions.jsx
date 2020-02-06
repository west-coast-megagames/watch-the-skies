import React, { Component } from 'react';
import Interceptors from '../../components/interceptorsTable';
import Contacts from '../../components/contactsTable';
import InterceptorDeployForm from '../../components/interceptorsDeploy';
import InterceptorInfo from '../../components/interceptorInfo';

class Interception extends Component {

  state = {
    contacts: [],
    aircrafts: [],
    bases: [],
    cities: [],
    isDeploying: false,
    contact: undefined,
    showInfo: false,
    interceptor: undefined
  };

  close = () => {
    this.setState({
      showInfo: false
    });
  }
  toggleDrawer = () => {
    this.setState({ showInfo: true });
  }

  componentDidMount() {
    this.radarSweep();
    this.sitesSort();
  };

  componentDidUpdate(prevProps) {
    if(prevProps.aircrafts !== this.props.aircrafts){
      this.radarSweep();
      this.sitesSort();
    }
  }

  componentWillUnmount() {
    clearInterval(this.radarSweep);
  };

  render(){
    return (
      <React.Fragment>
          <Contacts 
            deployInterceptors={ this.deployInterceptors }
            contacts={this.state.contacts}
            bases={this.state.bases}
            cities={this.state.cities}
          />
          <hr />
          <Interceptors
            aircrafts={this.state.aircrafts}
            onClick={ this.showInfo }
          />

          { this.state.showInfo ? <InterceptorInfo
            interceptor={ this.state.interceptor }
            show={ this.showInfo }
            close={ this.close }
            toggleDrawer={ this.toggleDrawer }
            alert={ this.props.alert }
            /> : null }

          { this.state.isDeploying ? <InterceptorDeployForm 
            aircrafts={ this.state.aircrafts }
            deployInterceptors={ this.deployInterceptors }
            show={ this.state.isDeploying }
            handleChange={ this.handleChange }
            interceptor={ this.state.interceptor }
            contact={this.state.contact}
            alert={ this.props.alert } 
          /> : null }
      </React.Fragment>
    );
  };

  sitesSort() {
    let bases = this.props.sites.filter(site => site.__t === 'BaseSite' );
    let cities = this.props.sites.filter(site => site.__t === 'CitySite' );

    this.setState({ bases, cities })
  }

  radarSweep() {
    let data = this.props.aircrafts.filter(aircraft => aircraft.status.destroyed !== true);

    let contacts = data.filter(aircraft => aircraft.team._id !== this.props.team._id);
    contacts = contacts.filter(aircraft => aircraft.status.deployed === true);

    let aircrafts = data.filter(aircraft => aircraft.team._id === this.props.team._id);

    this.setState({ contacts, aircrafts });
    console.log('Contacts and Aircrafts set...');
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
