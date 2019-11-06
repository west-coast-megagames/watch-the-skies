import React, { Component } from 'react';
import ReactDOM from 'react-dom'
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
  constructor(props) {
    super(props)
    this.state = {
      ships: [],
      interceptor: null
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    console.log( this.props.deployData )
    this.setState({
      interceptor: event.target.value
    })
  }

  handleSubmit(event) {
    event.preventDefault();

    if ( this.state.interceptor === null ){
      return;
    }
    // want to update the database here?
    this.props.deployInterceptors( 'deployed', null, this.state.interceptor );
  }

  async componentDidMount() {
      let { data: ships } = await axios.get('http://localhost:5000/api/interceptor');
      ships = ships.filter(s => s.team === 'US');
      ships = ships.filter( s => s.status.deployed === false );
      this.setState({ ships });
  };

  render() {
    return(
      <React.Fragment>
          <div id="deployForm" style={ deployStyle }>
            <form name="deployForm" style={ formStyle } onSubmit={ this.handleSubmit   }>
              <div className="form-group">
                  <label htmlFor="exampleFormControlSelect1">Scramble vehicle to intercept contact { this.props.deployData.contact }</label>
                  <select className="form-control" onChange={ this.handleChange }>
                    <option></option>
                    { this.state.ships.map(ship => (
                        <option key="value={ship._id}" value={ship._id}>{ ship.designation } ( { ship.location.poi } at { 100 - Math.round(ship.stats.hull / ship.stats.hullMax * 100) }% health) </option>
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
