import React, { Component } from 'react';
import axios from 'axios';

var styles = {
  'position':'fixed',
  'top': '50%',
  'left': '50%',
  'zIndex': 100,
  'width': '50%',
  'padding': '1em',
  'transform': 'translate( -50%, -50% )',
  'border': '1px solid #000',
  'backgroundColor': '#fff'
};

class InterceptorDeployForm extends Component {
  state = {
      ships: []
  };

  test = () => {
    console.log( 'hi' );
  };

  async componentDidMount() {
      let { data: ships } = await axios.get('http://localhost:5000/api/interceptor');
      ships = ships.filter(s => s.team === 'US');
      ships = ships.filter( s => s.status.deployed === false );
      this.setState({ ships });
  };

  render() {
    return(
      <React.Fragment>
          <form style={styles}>
            <div className="form-group">
                <label htmlFor="exampleFormControlSelect1">Scramble vehicle to intercept contact</label>
                <select className="form-control" id="exampleFormControlSelect1">
                  { this.state.ships.map(ship => (
                      <option key={ship._id}>{ ship.designation } ( { ship.location.poi } at { 100 - Math.round(ship.stats.hull / ship.stats.hullMax * 100) }% health) </option>
                  ))}
                </select>
            </div>
            <button type="submit" className="btn btn-primary">Commit</button>
            <button type="submit" className="btn btn-primary">Cancel</button>
          </form>
      </React.Fragment>
    )
  };
};

export default InterceptorDeployForm;
