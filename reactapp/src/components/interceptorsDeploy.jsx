import React, { Component } from 'react';
import { Drawer, Button, InputPicker } from 'rsuite'
import { gameServer } from '../config';
import axios from 'axios';

const missions = [
  { value: "Interception", label: "Intercept and attack target aircraft"},
  { value: "Escort", label: "Escort and protect target aircraft"},
  { value: "Patrol", label: "Patrol above and protect target site"},
  { value: "Transport", label: "Transport cargo from target site"},
  { value: "Recon", label: "Gather info about target site or aircraft"},
  { value: "Diversion", label: "Destract above target site"}
]

class InterceptorDeployForm extends Component {

  state = {
    ships: [],
    interceptor: this.props.interceptor,
    target: this.props.target,
    missions: missions,
    mission: ''
  }

  handleSubmit = async () => {
    console.log('Submitting Interception');
    this.props.deployInterceptors( 'deployed', this.state.target, this.state.interceptor );

    let stats = {
      aircraft: this.state.interceptor._id,
      target: this.state.target._id,
      mission: this.state.mission
    };

    try {
      let response = await axios.put(`${gameServer}api/intercept`, stats);
      this.props.alert({type: 'success', title: 'Interceptor Launch...', body: response.data })
    } catch (err) {
      this.props.alert({type: 'error', title: 'Launch Failed', body: `${err.data} - ${err.message}` })
    };

  }

  handleChange = event => {
    let interceptor = this.state.interceptor;
    interceptor = event.currentTarget.value;
    this.setState({
      interceptor
    });
    console.log( event.currentTarget.value );
    console.log( this.state.interceptor )
  }

  render() {
    return(
      <Drawer
        size='md'
        show={this.props.show}
        onHide={this.props.close}
      >
        <Drawer.Header>
          <Drawer.Title>Aircraft Information</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body>
            <form>
              <div className="form-group">
                <label htmlFor="exampleFormControlSelect1">Scramble vehicle to intercept over { this.props.target.location.country.name }</label>
                  <select className="form-control" form="deployForm" value={ this.state.interceptor } onChange={ this.handleChange }>
                    <option>Select an interceptor!</option>
                    { this.props.aircrafts.filter(aircraft => aircraft.status.deployed !== true).map(ship => (
                        <option key={ship._id} value={ship._id}>{ ship.name } ( { ship.location.country.name } | { 100 - Math.round(ship.stats.hull / ship.stats.hullMax * 100) }% damage) </option>
                    ))}
                  </select>
                  <InputPicker placeholder="Mission Selection" data={this.state.missions} value={this.state.mission} onChange={value => (this.setState({ mission: value }))}block />
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
};

export default InterceptorDeployForm;