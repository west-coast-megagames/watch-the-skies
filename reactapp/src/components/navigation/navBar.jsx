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
		seconds = seconds > 0 ? Math.floor((t / 1000) % 60) : 0;
		minutes = minutes > 0 ? Math.floor((t / 1000 / 60) % 60) : 0;
		hours = hours > 0 ? Math.floor((t / (1000 * 60 * 60)) % 24) : 0;
		// let days = Math.floor( t/(1000*60*60*24) );
	}

	clock = { seconds, minutes, hours };
	seconds = seconds < 10 ? '0' + seconds : seconds;
	minutes = minutes < 10 ? '0' + minutes : minutes;
	hours = hours < 10 ? '0' + hours : hours;

	return { time: `${hours > 0 ? `${hours}:` : '' }${minutes}:${seconds}`, clock };
}

let interval = undefined;

const NavBar = (props) => {
	const [time, setTime] = React.useState('');
	const [clock, setClock] = React.useState({ hours: 0, minutes: 0, seconds: 0, });
	const [deadline, setDeadline] = React.useState(Date.now());
	const [info, setInfo] = React.useState({ phase: 'Test Phase', turn: 'Test Turn', turnNum: 0, year: 2021 });
	const [paused, setPaused] = React.useState(true);

	useEffect(() => {
		playTrack('bootup');
		socket.on('clock', (data) => {

			const { deadline, hours, minutes, seconds, phase, turn, turnNum, year, clock } = data;
			if (data.paused) clearInterval(interval);
			setTime(clock);
			setPaused(data.paused)
			setClock({ hours, minutes, seconds });
			setDeadline(deadline);
			setInfo({ phase, turn, turnNum, year });
			console.log(data);
		})
		socket.emit('request', {route: 'clock', action:'getState'})
		return () => socket.off('clock');
	}, []);

	useEffect(() => {
		if (!paused) interval = setTimeout(() => {
			if (paused) clearInterval(interval)
			let setter = getTimeRemianing(clock, deadline);
			setTime(setter.time);
			setClock(setter.clock);
		}, 1000);
	}, [paused, clock]);

	const rawr = props.account !== undefined ? props.account.resources.find(el => el.type === 'Megabucks') : undefined

	const megabucks = props.account !== undefined ? rawr.balance : 0
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
			{ props.login && <span className="navbar-text mr-md-5">{info.phase} {time} <FontAwesomeIcon icon={faClock} /> | {info.turnNum >= 0 ? `${info.turn} ${info.year}` : `${info.turn}`}</span> }
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