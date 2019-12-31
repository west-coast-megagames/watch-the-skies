import React, { Component } from 'react';
import InterceptorLogs from './logTable';
// import axios from 'axios';

var infoStyle = {
  'position': 'fixed',
  'top': '50%',
  'left': '50%',
  'zIndex': 100,
  'width': '75%',
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

class InterceptorInfo extends Component {

  state = {}

  // handleChange = event => {
  //   let interceptor = this.state.interceptor;
  //   interceptor = event.currentTarget.value;
  //   this.setState({
  //     interceptor
  //   });
  //   console.log( event.currentTarget.value );
  //   console.log( this.state.interceptor )
  // }

  render() {
    let { stats, designation, location } = this.props.interceptor;

    return(
      <React.Fragment>
        <div id="deployForm" style={ deployStyle }>
          <div id='infoContainer' style={ infoStyle }>
            <h4>{ designation }</h4>
            <div className="container">
              <div className="row">
                <div className="col"><p>Integrity: { stats.hull }/{stats.hullMax}</p></div>
                <div className="col"><p>Dmg Rating: { stats.damage }</p></div>
                <div className="w-100"></div>
                <div className="col"><p>Zone: { location.zone.zoneName }</p></div>
                <div className="col"><p>Country: { location.country.countryName }</p></div>
              </div>
            </div>
            <hr />
            <h4>Systems</h4>
            <p>This ship has no systems...</p>
            <hr />
            <InterceptorLogs
              interceptor={ this.props.interceptor }
              alert={ this.props.alert }
            />
            <button type="cancel" value="Cancel" onClick={ () => this.props.onClick( 'cancel' ) } className="btn btn-primary">Cancel</button>
          </div>
        </div>
      </React.Fragment>
    )
  };
};

export default InterceptorInfo;