import React, { Component } from 'react';
import { Drawer, Button, InputPicker } from 'rsuite'
import { gameServer } from '../config';
import axios from 'axios';

const data = [
  { value: "Aggressive", label: "Aggresive Stance"},
  { value: "Passive", label: "Passive Stance"}
]

class InterceptorDeployForm extends Component {

  state = {
    ships: [],
    interceptor: this.props.interceptor,
    contact: this.props.contact
  }

  handleSubmit = async () => {
    console.log('Submitting Interception');
    this.props.deployInterceptors( 'deployed', this.state.contact, this.state.interceptor );

    let stats = {
      attacker: this.state.interceptor,
      defender: this.state.contact
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
                <label htmlFor="exampleFormControlSelect1">Scramble vehicle to intercept over { this.props.contact.location.country.countryName }</label>
                  <select className="form-control" form="deployForm" value={ this.state.interceptor } onChange={ this.handleChange }>
                    <option>Select an interceptor!</option>
                    { this.props.aircrafts.filter(aircraft => aircraft.status.deployed !== true).map(ship => (
                        <option key={ship._id} value={ship._id}>{ ship.designation } ( { ship.location.country.countryName } | { 100 - Math.round(ship.stats.hull / ship.stats.hullMax * 100) }% damage) </option>
                    ))}
                  </select>
                  <InputPicker placeholder="Aircraft Interception Stance" data={data} block />
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