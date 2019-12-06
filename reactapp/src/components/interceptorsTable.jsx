import React, { Component } from 'react';

class Interceptors extends Component {

    retreiveStatus = (aircraft) => {
      if (!aircraft.status.deployed) {
        return 'Idle';
      } else if (aircraft.status.deployed && aircraft.status.mission !== false ){
        return 'Intercepting contact';
      } else if (aircraft.status.ready) {
        return 'Ready';
      }
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
                    </tr>
                </thead>
                <tbody>
                { this.props.aircrafts.map(aircraft => (
                    <tr key={ aircraft._id }>
                        <td>{ aircraft.designation }</td>
                        <td>Someone</td>
                        <td>{ 100 - Math.round(aircraft.stats.hull / aircraft.stats.hullMax * 100) }%</td>
                        <td>{ aircraft.location.poi }</td>
                        <td>{ this.retreiveStatus(aircraft) }</td>
                    </tr>
                    ))}
                </tbody>
            </table>
            </React.Fragment>
        );
    }
}

export default Interceptors;
