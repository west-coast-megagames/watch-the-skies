import React, { Component } from 'react';
import axios from 'axios';

var formStyle = {
  'position': 'fixed',
  'top': '50%',
  'left': '50%',
  'zIndex': 100,
  'width': '50%',
  'padding': '1em',
  'transform': 'translate( -50%, -50% )',
  'border': '1px solid #000',
  'backgroundColor': '#fff'
};

var deployStyle = {
  'position': 'fixed',
  'left': 0,
  'top': 0,
  'width': '100%',
  'height': '100%',
  'zIndex': 50,
  'backgroundColor': 'rgba( 0, 0, 0, 0.4 )'
}

class InterceptorDeployForm extends Component {

  state = {
    ships: [],
    interceptor: this.props.interceptor,
    contact: this.props.contact
  }

  handleSubmit = async event => {
    event.preventDefault();

    console.log('Submitting Interception');
    this.props.deployInterceptors( 'deployed', this.state.contact, this.state.interceptor );

    let stats = {
      attacker: this.state.interceptor,
      defender: this.state.contact
    };

    try {
      let response = await axios.put('http://localhost:5000/api/intercept', stats);
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
      <React.Fragment>
          <div id="deployForm" style={ deployStyle }>
            <form id="deployForm" style={ formStyle } onSubmit={ this.handleSubmit }>
              <div className="form-group">
                <label htmlFor="exampleFormControlSelect1">Scramble vehicle to intercept over { this.props.contact.location.country.countryName }</label>
                  <select className="form-control" form="deployForm" value={ this.state.interceptor } onChange={ this.handleChange }>
                    <option>Select an interceptor!</option>
                    { this.props.aircrafts.filter(aircraft => aircraft.status.deployed !== true).map(ship => (
                        <option key={ship._id} value={ship._id}>{ ship.designation } ( { ship.location.poi } at { 100 - Math.round(ship.stats.hull / ship.stats.hullMax * 100) }% health) </option>
                    ))}
                  </select>
              </div>
              <button type="submit" value="Submit" className="btn btn-primary">Commit</button>
              <button type="cancel" value="Cancel" onClick={ () => this.props.deployInterceptors( 'cancel' ) } className="btn btn-primary">Cancel</button>
            </form>
          </div>
      </React.Fragment>
    )
  };
};

export default InterceptorDeployForm;