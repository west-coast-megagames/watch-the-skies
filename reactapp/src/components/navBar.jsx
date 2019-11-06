import React, { Component } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { subscribeToClock } from '../api';

class NavBar extends Component {
    state = { 
        country: "United States",
        treasury: 30,
        prLevel: 6,
        minutes: 0,
        seconds: 0,
        phase: 'Test Phase',
        turn:  'Test Turn'
     }

    constructor(props) {
        super(props);

        //subscribeToTimer(1000, (err, timestamp) => this.setState({ gameClock: timestamp }));
        subscribeToClock((err, clock) => this.setState({ minutes: clock.minutes, seconds: clock.seconds, phase: clock.phase, turn: clock.turn }));
    }

    render() {
        
        const { minutes, seconds, prLevel, treasury, country, phase, turn } = this.state;
        const clock = `Game Clock: ${minutes}:${seconds} | ${phase} of ${turn} `;
        const statusBar =  `PR Level: ${prLevel} | Treasury: $M${treasury} | ${country}`;

        return (
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <Link className="navbar-brand" to="/">WCM</Link>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav">
                    <li className="nav-item">
                        <NavLink className="nav-link" to="/budget">Governance</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className="nav-link" to="/interceptions">Operations</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className="nav-link" to="/login">Login</NavLink>
                    </li>
                </ul>
            </div>
            <span className="navbar-text mr-md-5">{clock}</span>
            <span className="navbar-text">{statusBar}</span>
        </nav>
        );
    }
}
 
export default NavBar;