import React, { Component } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserTie, faShieldAlt, faClock, faMoneyBillAlt } from '@fortawesome/free-solid-svg-icons';
import { subscribeToClock, updatePR, prUpdate } from '../api';

class NavBar extends Component {
    state = { 
        country: "United States",
        teamID: "5dc3ba7d79f57e32c40bf6b4",
        treasury: 30,
        prLevel: 6,
        minutes: 0,
        seconds: 0,
        phase: 'Test Phase',
        turn:  'Test Turn',
        turnNum: 0,
     }

    constructor(props) {
        super(props);
        //subscribeToTimer(1000, (err, timestamp) => this.setState({ gameClock: timestamp }));
        subscribeToClock((err, clock) => {
            if(this.state.turnNum !== clock.turnNum) {
                updatePR(this.state.teamID);
            }
            this.setState({ 
                minutes: clock.minutes,
                seconds: clock.seconds,
                phase: clock.phase,
                turn: clock.turn,
                turnNum: clock.turnNum
            })
            console.log(`minutes: ${clock.minutes} | seconds: ${clock.seconds}`);
        });

        prUpdate((err, data) => {
            console.log(`Got: ${data.prScore}`);
            this.setState({
                prLevel: data.prScore,
                treasury: data.treasury
            })
        })
    }

    render() {
        
        const { minutes, seconds, prLevel, treasury, country, phase, turn } = this.state;
        const clock = `${minutes}:${seconds}`;
        const pr =  `PR Level: ${prLevel} | `
        const finance = ` $M${treasury} | `
        const team = `${country}`;

        return (
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <Link className="navbar-brand" to="/">WCM</Link>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav">
                    <li className="nav-item">
                        <NavLink className="nav-link" to="/budget"><FontAwesomeIcon icon={faUserTie} /> Governance</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className="nav-link" to="/interceptions"><FontAwesomeIcon icon={faShieldAlt} /> Operations</NavLink>
                    </li>
                    {/* <li className="nav-item">
                        <NavLink className="nav-link" to="/login">Login</NavLink>
                    </li> */}
                </ul>
            </div>
            <span className="navbar-text mr-md-5">{phase} {clock} <FontAwesomeIcon icon={faClock} /> | {turn}</span>
            <span className="navbar-text mr-1">{pr}</span>
            <span className="navbar-text mr-1"> <FontAwesomeIcon icon={faMoneyBillAlt} /> {finance}</span>
            <span className="navbar-text mr-1"> {team}</span>
        </nav>
        );
    }
}
 
export default NavBar;