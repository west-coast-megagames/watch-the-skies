import React, { Component } from 'react';
import axios from 'axios';

class Interceptors extends Component {

    state = {
        ships: []
    };

    async componentDidMount() {
        let { data: ships } = await axios.get('http://localhost:5000/api/interceptor');
        ships = ships.filter(s => s.team === 'US');
        this.setState({ ships })
    }

    /*deploy = (aircraft) => {
        console.log(aircraft)
        const ships = this.state.ships.filter(s => s._id !== aircraft._id);
        this.setState({ ships });
    };*/

    retreiveStatus = (ship) => {
      if ( !ship.status.deployed ) {
        return 'Idle';
      }
      else if ( ship.status.deployed && ship.status.mission !== false ){
        return 'Intercepting contact';
      }
    }

    render() {
        const { length: count } = this.state.ships;

        if (count === 0)
            return <p>No interceptors currently availible.</p>
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
                { this.state.ships.map(ship => (
                    <tr key={ ship._id }>
                        <td>{ ship.designation }</td>
                        <td>Someone</td>
                        <td>{ 100 - Math.round(ship.stats.hull / ship.stats.hullMax * 100) }%</td>
                        <td>{ ship.location.poi }</td>
                        <td>{ this.retreiveStatus( ship ) }</td>

                    </tr>
                    ))}
                </tbody>
            </table>
            </React.Fragment>
        );
    }
}

export default Interceptors;
