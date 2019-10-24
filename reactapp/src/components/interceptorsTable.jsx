import React, { Component } from 'react';
import axios from 'axios'

class Interceptors extends Component {
    state = { 
        ships: [],
        alerts: [],
    };

    async componentDidMount() {
        let { data: ships } = await axios.get('http://localhost:5000/api/interceptor');
        ships = ships.filter(s => s.team === 'US');
        this.setState({ ships })
    }

    status = (ship) => {
        console.log(ship)

        return(
            <div class="alert alert-light" role="alert">
                {ship.designation} is currently docked
            </div>            
        )
    };

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
                        <th>Current Base</th>
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
                        <td><button onClick={() => this.status(ship) } className="btn btn-warning btn-sm">Status</button></td>
                    </tr>
                    ))}
                </tbody>
            </table>
            </React.Fragment>
        );
    }
}
 
export default Interceptors;