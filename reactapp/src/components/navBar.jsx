import React, { Component } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserTie, faShieldAlt, faClock, faMoneyBillAlt } from '@fortawesome/free-solid-svg-icons';
import { gameClock, teamEvents } from '../api';
import TeamSelect from './common/teamSelect';

class NavBar extends Component {
    state = { 
        minutes: 0,
        seconds: 0,
        phase: 'Test Phase',
        turn:  'Test Turn',
        turnNum: 0,
     }

    constructor(props) {
        super(props);
        gameClock.subscribeToClock((err, clock) => {
            if(this.state.turn !== 'Test Turn' && this.state.turnNum !== clock.turnNum) {
                teamEvents.updateTeam(this.props.team._id);
            }
            this.setState({ 
                minutes: clock.minutes,
                seconds: clock.seconds,
                phase: clock.phase,
                turn: clock.turn,
                turnNum: clock.turnNum
            })
            // console.log(`minutes: ${clock.minutes} | seconds: ${clock.seconds}`);
        });
    };

    render() {
        let megabucks = 0;
        if (this.props.team.name !== "Select Team") {
            let accountIndex = this.props.team.accounts.findIndex((account => account.name === 'Treasury'));
            megabucks = this.props.team.accounts[accountIndex].balance
        }

        const { minutes, seconds, phase, turn } = this.state;
        const clock = `${minutes}:${seconds}`;
        const pr = this.props.team.name !== "Select Team" ? `PR Level: ${this.props.team.prLevel} | ` : 'PR Level: Unknown |'
        const megabuckDisplay = ` $M${megabucks} | `

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
            <span className="navbar-text mr-1"> <FontAwesomeIcon icon={faMoneyBillAlt} /> {megabuckDisplay}</span>
            <span className="navbar-text mr-1"> {this.props.team.name} </span>
            <TeamSelect teams={this.props.teams} onChange={ this.props.onChange } />
            </nav>
        );
    }
}
 
export default NavBar;