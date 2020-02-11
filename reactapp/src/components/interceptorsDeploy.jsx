import React, { Component } from 'react';
import { Drawer, Button, InputPicker } from 'rsuite'
import { gameServer } from '../config';
import axios from 'axios';

let missions = [
  { value: "Interception", label: "Intercept | Attack target aircraft", aircraft: true, site: false},
  { value: "Escort", label: "Escort | Protect target aircraft" , aircraft: true, site: false},
  { value: "Patrol", label: "Patrol | Protect target site", aircraft: false, site: true},
  { value: "Transport", label: "Transport | Take cargo to/from target site", aircraft: false, site: true},
  { value: "Recon", label: "Recon | Gather info about target site or aircraft", aircraft: true, site: true},
  { value: "Diversion", label: "Diversion | Destract above target site", aircraft: false, site: true}
]
class InterceptorDeployForm extends Component {

  state = {
    ships: [],
    interceptor: undefined,
    target: this.props.target,
    missions: missions
  }

  render() {
    if (this.state.target.model === 'Site') {
      missions = missions.filter(mission => mission.site === true)
    } else {
      missions = missions.filter(mission => mission.aircraft === true)
    }
    return(
      <Drawer
        size='md'
        show={this.props.show}
        onHide={() => this.props.deployInterceptors( 'cancel' )}
      >
        <Drawer.Header>
          <Drawer.Title>Target Information</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body>
            <form>
              <div className="form-group">
                  <select className="form-control" form="deployForm" value={ this.state.interceptor } onChange={ this.handleChange }>
                    <option>Scramble aircraft to fly mission over { this.props.target.country.name }</option>
                    { this.props.aircrafts.filter(aircraft => aircraft.status.deployed !== true).map(ship => (
                        <option key={ship._id} value={ship._id}>{ ship.name } ( { ship.country.name } | { 100 - Math.round(ship.stats.hull / ship.stats.hullMax * 100) }% damage)</option>
                    ))}
                  </select>
                  <InputPicker placeholder="Mission Selection" data={missions} value={this.state.mission} onChange={value => (this.setState({ mission: value }))}block />
              </div>
            </form>
        </Drawer.Body>
        <Drawer.Footer>
          <Button onClick={ this.handleSubmit } appearance="primary">Confirm</Button>
          <Button onClick={ () => this.props.deployInterceptors( 'cancel' ) } appearance="subtle">Cancel</Button>
        </Drawer.Footer>
      </Drawer>
    )
  };

  handleSubmit = async () => {
    console.log('Submitting Interception');
    let stats = {
      aircraft: this.state.interceptor,
      target: this.state.target._id,
      mission: this.state.mission
    };
    this.props.deployInterceptors( 'deployed', this.state.target, this.state.interceptor );

    try {
      console.log(stats)
      let response = await axios.put(`${gameServer}api/intercept`, stats);    
      this.props.alert({type: 'success', title: 'Interceptor Launch...', body: response.data })
    } catch (err) {
      this.props.alert({type: 'error', title: 'Launch Failed', body: `${err.data} - ${err.message}` })
    };

  }

  handleChange = event => {
    console.log(`Handling change...`)
    let interceptor = this.state.interceptor;
    interceptor = event.currentTarget.value;
    this.setState({
      interceptor
    });
  }
};

export default InterceptorDeployForm;