import React, { useEffect } from 'react'; // React
import { connect } from 'react-redux'; // Redux store provider
import { Link } from 'react-router-dom'; // Link wrapper for react router
import socket from '../../socket' // Socket.io client

// Components
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TeamAvatar from '../common/teamAvatar';

// Images
import nexus from '../../img/Project_Nexus_Square_Small.png'
import { faClock, faMoneyBillAlt } from '@fortawesome/free-solid-svg-icons';

// Redux Selectors
import { getTreasuryAccount } from '../../store/entities/accounts';

// Scripts
import playTrack from '../../scripts/audio';

function getTimeRemianing(clock, deadline) {
	const now = new Date(Date.now());
	let hours = clock.hours;
	let minutes = clock.minutes;
	let seconds = clock.seconds;

	if(!clock.paused) {
		const t = Date.parse(deadline) - Date.parse(now);
		seconds = Math.floor((t / 1000) % 60);
		minutes = Math.floor((t / 1000 / 60) % 60);
		hours = Math.floor((t / (1000 * 60 * 60)) % 24);
		// let days = Math.floor( t/(1000*60*60*24) );
	}
	seconds = seconds < 10 ? '0' + seconds : seconds;
	minutes = minutes < 10 ? '0' + minutes : minutes;
	hours = hours < 10 ? '0' + hours : hours;

	return `${hours > 0 ? `${hours}:` : '' }${minutes}:${seconds}`;
}

let interval = undefined;

const NavBar = (props) => {
	const [clock, setClock] = React.useState({ clock: '00:00', hours: 0, minutes: 0, seconds: 0, });
	const [deadline, setDeadline] = React.useState(Date.now());
	const [info, setInfo] = React.useState({ phase: 'Test Phase', turn:  'Test Turn', turnNum: 0, year: 2021 });
	const [paused, setPaused] = React.useState(true);

	useEffect(() => {
		playTrack('bootup');
		socket.on('clock', (data) => {
			const { paused, clock, deadline, hours, minutes, seconds, phase, turn, turnNum, year } = data;
			setClock({ time: clock, hours, minutes, seconds });
			setInfo({ phase, turn, turnNum, year });
			setDeadline(deadline);
			setPaused(paused)
			console.log(data);
		})
		socket.emit('request', {route: 'clock', action:'getState'})
		return () => socket.off('clock');
	}, []);

	useEffect(() => {
		playTrack('bootup');
		socket.on('clock', (data) => {
			const { clock, hours, minutes, seconds } = data;
			setClock({ time: clock, hours, minutes, seconds });
			console.log(data);
		})
		socket.emit('request', {route: 'clock', action:'getState'})
		return () => socket.off('clock');
	}, [])

	useEffect(() => {
		if (!paused) interval = setTimeout(() => {
			const { hours, minutes, seconds } = clock;
			setClock({ time: getTimeRemianing(clock, deadline), hours, minutes, seconds });
		}, 1000);
		if (paused) clearInterval(interval)
	}, [paused, clock]);

	const megabucks = props.account !== undefined ? props.account.balance : 0
	const pr = !props.team ? 'PR Level: Unknown |' : `PR Level: ${props.team.prLevel} | `;
	const megabuckDisplay = ` $M${megabucks} | `
	const brandLink = !props.team ? '/' : '/home';

	return (
		<nav className="navbar navbar-expand-lg navbar-dark bg-dark">
			<Link className="navbar-brand" to={brandLink}>
					<img src={nexus} alt='Project Nexus Logo' height='30px' />
					Project Nexus
			</Link>
			<div className="collapse navbar-collapse" id="navbarNav" />
			{ props.login && <span className="navbar-text mr-md-5">{info.phase} {clock.time} <FontAwesomeIcon icon={faClock} /> | {info.turn}</span> }
			{ props.login && <span className="navbar-text mr-1">{pr}</span> }
			{ props.login && <span className="navbar-text mr-1"> <FontAwesomeIcon icon={faMoneyBillAlt} /> {megabuckDisplay}</span> }
			<span className="navbar-text mr-1"> {!props.team ? <Link to="/login">Sign In</Link> : props.team.name} </span>
			<TeamAvatar size={'xs'} code={!props.team ? null : props.team.code} />
			<div><audio ref={React.createRef()} src="./fifteen-minutes.ogg" autoPlay/></div>
		</nav>
	)
};

const mapStateToProps = state => ({
    team: state.auth.team,
    login: state.auth.login,
    account: state.auth.team ? getTreasuryAccount(state) : undefined
});
  
const mapDispatchToProps = dispatch => ({});
  
export default connect(mapStateToProps, mapDispatchToProps)(NavBar);