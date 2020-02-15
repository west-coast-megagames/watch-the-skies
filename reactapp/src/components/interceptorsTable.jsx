import React, { Component } from 'react';

class Interceptors extends Component {

    retreiveStatus = (aircraft) => {
      if (!aircraft.status.deployed) {
        return 'Idle';
      } else if (aircraft.status.deployed && aircraft.status.mission !== false ){
        return 'Intercepting Target...';
      } else if (aircraft.status.deployed) {
        return 'On mission...';
      }
    }

    getLocation = (aircraft) => {
        let location = aircraft.country.name !== undefined ? aircraft.country.name : aircraft.country.name;
        return location;
    }

    render() {
        const { length: count } = this.props.aircrafts;

        if (count === 0)
            return <h4>No interceptors currently availible.</h4>
        return (
            <React.Fragment>
                <p>You currently have {count} interceptors in base.</p>
                <table className="table">
                <thead>
                    <tr>
                        <th>Aircraft</th>
                        <th>Pilot</th>
                        <th>Frame Damage</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Unit Info</th>
                    </tr>
                </thead>
                <tbody>
                { this.props.aircrafts.map(aircraft => (
                    <tr key={ aircraft._id }>
                        <td>{ aircraft.name }</td>
                        <td>Someone</td>
                        <td>{ 100 - Math.round(aircraft.stats.hull / aircraft.stats.hullMax * 100) }%</td>
                        <td>{ this.getLocation(aircraft) }</td>
                        <td>{ this.retreiveStatus(aircraft) }</td>
                        <td><button type="info" value="Info" onClick={ () => this.props.onClick('info', aircraft) } className="btn btn-info">Info</button></td>
                    </tr>
                    ))}
                </tbody>
            </table>
            </React.Fragment>
        );
    }
}

export default Interceptors;
