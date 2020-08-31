import React, { Component } from 'react';
import { connect } from 'react-redux'; // Redux store provider
import { Link } from 'react-router-dom';
import nexus from '../../img/Project_Nexus_Square_Small.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faMoneyBillAlt } from '@fortawesome/free-solid-svg-icons';
import TeamAvatar from '../common/teamAvatar';
import playTrack from '../../scripts/audio';
import { getTreasuryAccount } from '../../store/entities/accounts';

class NavBar extends Component {
    state = { 
        minutes: 0,
        seconds: 0,
        phase: 'Test Phase',
        turn:  'Test Turn',
        turnNum: 0
     }

    componentDidMount() {
        playTrack('bootup');
    }

    componentDidUpdate(prevProps) {
        if(prevProps.seconds !== this.props.seconds) {
            this.setState({ 
                minutes: this.props.clock.minutes,
                seconds: this.props.clock.seconds,
                phase: this.props.clock.phase,
                turn: this.props.clock.turn,
                turnNum: this.props.clock.turnNum
            })
        }
    }

    render() {
        const { minutes, seconds, phase, turn } = this.props.clock;
        const megabucks = this.props.account !== undefined ? this.props.account.balance : 0
        const clock = `${minutes}:${seconds}`;
        const pr = this.props.team === null ? 'PR Level: Unknown |' : `PR Level: ${this.props.team.prLevel} | `;
        const megabuckDisplay = ` $M${megabucks} | `
        const brandLink = this.props.team === null ? '/' : '/home';

        return (
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <Link className="navbar-brand" to={brandLink}>
                    <img src={nexus} alt='Project Nexus Logo' height='30px' />
                    Project Nexus
                    </Link>
                <div className="collapse navbar-collapse" id="navbarNav">
                    {/* <ul className="navbar-nav">
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/budget"><FontAwesomeIcon icon={faUserTie} /> Governance</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/interceptions"><FontAwesomeIcon icon={faShieldAlt} /> Operations</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/login">Login</NavLink>
                        </li>
                    </ul> */}
                </div>
                <span className="navbar-text mr-md-5">{phase} {clock} <FontAwesomeIcon icon={faClock} /> | {turn}</span>
                <span className="navbar-text mr-1">{pr}</span>
                <span className="navbar-text mr-1"> <FontAwesomeIcon icon={faMoneyBillAlt} /> {megabuckDisplay}</span>
                <span className="navbar-text mr-1"> {this.props.team === null ? <Link to="/login">Sign In</Link> : this.props.team.name} </span>
                <TeamAvatar size={'xs'} teamCode={this.props.team === null ? null : this.props.team.teamCode} />
                <div><audio ref={React.createRef()} src="./fifteen-minutes.ogg" autoPlay/></div>
            </nav>
        );
    }
}

const mapStateToProps = state => ({
    team: state.auth.team,
    login: state.auth.login,
    account: state.auth.login === true ? getTreasuryAccount(state) : undefined
});
  
const mapDispatchToProps = dispatch => ({});
  
export default connect(mapStateToProps, mapDispatchToProps)(NavBar);