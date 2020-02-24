import React, { Component } from 'react';
import Interceptors from '../../components/interceptorsTable';
import Contacts from '../../components/contactsTable';
import InterceptorDeployForm from '../../components/interceptorsDeploy';
import InfoAircaft from '../../components/infoAircaft';

class Interception extends Component {

  state = {
    contacts: [],
    aircrafts: [],
    bases: [],
    cities: [],
    isDeploying: false,
    contact: undefined,
    showInfo: false,
    aircraft: undefined
  };

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
            account={this.props.account}
          />
          <hr />
          <Interceptors
            aircrafts={this.state.aircrafts}
            onClick={ this.showInfo }
          />

          { this.state.showInfo ? <InfoAircaft
            aircraft={ this.state.aircraft }
            show={ this.state.showInfo }
            onClick={ this.showInfo }
            alert={ this.props.alert }
            /> : null }

          { this.state.isDeploying ? <InterceptorDeployForm 
            aircrafts={ this.state.aircrafts }
            deployInterceptors={ this.deployInterceptors }
            show={ this.state.isDeploying }
            handleChange={ this.handleChange }
            target={this.state.contact}
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

    let contacts = this.props.aircrafts.filter(aircraft => aircraft.status.deployed === true);

    let aircrafts = data.filter(aircraft => aircraft.team._id === this.props.team._id);

    this.setState({ contacts, aircrafts });
    console.log('Contacts and Aircrafts set...');
  } 

  deployInterceptors = async (context, contact, aircraft) =>{
    console.log(`Deploying ${contact}`)
    this.setState({
      isDeploying: !this.state.isDeploying
    });

    if ( context === 'cancel' ){
      this.setState({
        contact: undefined,
        aircraft: undefined
      });
      return;
    } else if ( context === 'deploy' ){
      this.setState({
        contact
      });
    } else if ( context === 'deployed' ){
      this.setState({
        aircraft
      });
    }
  };

  showInfo = async (context, aircraft) =>{
    this.setState({
      showInfo: !this.state.showInfo
    });

    if ( context === 'cancel' ){
      this.setState({
        aircraft: undefined
      });
      return;
    } else if ( context === 'info' ){
      this.setState({
        aircraft
      });
    }
  };
}

export default Interception;
