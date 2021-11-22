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
import { Button, Dropdown, Icon, IconButton, Panel } from 'rsuite';
import { clockRequested } from '../../store/entities/clock';

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

	hours = hours < 0 ? 0 : hours;
	minutes = minutes < 0 ? 0 : minutes;
	seconds = seconds < 0 ? 0 : seconds;

	clock = { seconds, minutes, hours };
	seconds = seconds < 10 ? '0' + seconds : seconds;
	minutes = minutes < 10 ? '0' + minutes : minutes;
	hours = hours < 10 ? '0' + hours : hours;

	return { time: `${hours > 0 ? `${hours}:` : '' }${minutes}:${seconds}`, clock };
}

let interval = undefined;

const NavBar = ({ team, login, account, paused, gameClock, deadline, info, lastFetch, clockRequested, loading }) => {
	const [time, setTime] = React.useState('');
	const [clock, setClock] = React.useState({ hours: 0, minutes: 0, seconds: 0, });

	useEffect(() => {
		console.log('Clock Loaded!');
		clearInterval(interval);
		interval = undefined;
		return () => {     
			clearInterval(interval);
			interval = undefined;
			console.log('Clock Un-Loaded!')
		};
	}, []);

	useEffect(() => {
		let setter = getTimeRemianing(gameClock, deadline);
		// setTime(setter.time);
		// setClock(setter.clock);

		clearInterval(interval);
		interval = undefined;
		
		if (!paused && (typeof interval != "number")) interval = setInterval(() => {
			setter = getTimeRemianing(gameClock, deadline);
			// console.log('tick!');
			if (paused || (setter.clock.hours + setter.clock.minutes + setter.clock.seconds <= 0) || interval === undefined) clearInterval(interval)
			setTime(setter.time);
			setClock(setter.clock);
		}, 1000);
	}, [paused, gameClock, deadline]);
	

	const renderDropdown= () => {
		switch (info.phase) {	
			case 'Team Phase':
				return (						
					<Panel> 
						<div style={{ textAlign: 'center' }}>
							<h5>{info.phase}</h5>
							<p>Free to roam around and uh, do things TODO replace these icons</p>
						</div>
						<br/>
						<p><Icon icon='linux' /> - Assign Air Missions</p>
						<p><Icon icon='linux' /> - Assign Budgets to team</p>
						<p><Icon icon='android' /> - Assign Ground Missions</p>
						<div style={{ textAlign: 'center' }}>
							<b style={{ color: 'brown' }}>End of Round...</b>
						</div>
						<p><Icon icon='fighter-jet' /> - Aircraft Missions resolve</p>

					</Panel>)	
			case 'Action Phase':
				return (						
					<Panel> 
						<div style={{ textAlign: 'center' }}>
							<h5>{info.phase}</h5>
							<p>Free to roam around and uh, do things TODO replace these icons</p>
						</div>
						<br/>
						<p><Icon icon='linux' /> - Assign Military Missions</p>
						<p><Icon icon='linux' /> - Set Research</p>
						<p><Icon icon='android' /> - Assign Air Missions</p>
						<div style={{ textAlign: 'center' }}>
							<b style={{ color: 'brown' }}>End of Round...</b>
						</div>
						<p><Icon icon='shower' /> - Resolve Military Missions</p>
						<p><Icon icon='random' /> - Resolve Research</p>

					</Panel>)	
			case 'Free Phase':
				return (						
					<Panel> 
						<div style={{ textAlign: 'center' }}>
							<h5>{info.phase}</h5>
							<p>Free to roam around and uh, do things </p>
							<p> TODO replace these icons</p>
						</div>
						<br/>
						<p><Icon icon='linux' /> - Grey Market Open</p>
						<p><Icon icon='linux' /> - Set Production</p>
						<p><Icon icon='android' /> - Assign Air Missions</p>
						<div style={{ textAlign: 'center' }}>
							<b style={{ color: 'brown' }}>End of Round...</b>
						</div>
						<p><Icon icon='building' /> - Facilitys resolve production</p>
						<p><Icon icon='globe' /> - World Events Trigger</p>
					</Panel>)		
			default:
				return (						
					<Panel>
						Awaiting Game start...
					</Panel>)
		} // switch
	}

	const rawr = account !== undefined ? account.resources.find(el => el.type === 'Megabucks') : undefined
	
	const megabucks = rawr ? rawr.balance : 0
	const pr = !team ? 'PR Level: Unknown |' : `PR Level: ${team.prLevel} | `;
	const megabuckDisplay = ` $M${megabucks} | `
	const brandLink = !team ? '/' : '/home';

	return (
		<div style={{ backgroundColor: '#343a40', display: 'flex',  justifyContent: 'left',  alignItems: 'center',  color: 'silver', fontSize: '0.966em', borderBottom: '3px solid', borderRadius: 0, borderColor: '#d4af37' }} >
			
			<div style={{ width: '40%' }}> 
				<Link className="navbar-brand" style={{color: 'white' }} to={brandLink}>
						<img src={nexus} alt='Project Nexus Logo' height='30px' />
						Project Nexus
				</Link>
			</div>
			<div style={{ width: '40%' }}>
				{ login && <span className="navbar-text mr-md-5">
					<Button style={{ marginBottom: '5px', color: 'silver' }} appearance="link" size='xs'>
					<Dropdown trigger="hover" title={info.phase}>
    			<Dropdown.Item style={{ zIndex: 999 }}>
						{renderDropdown()}
					</Dropdown.Item>
 				 </Dropdown>
					</Button>
				{/* <Dropdown title={info.phase}>
    			<Dropdown>{info.phase}</Dropdown>
 				 </Dropdown> */}
					 
					
					{time} <FontAwesomeIcon icon={faClock} /> | {info.turnNum >= 0 ? `${info.turn} ${info.year}` : `${info.turn}`}
						{ login && <Icon spin={loading} onClick={() => { clockRequested(); socket.emit('request', {route: 'clock', action:'getState'}); }} style={{ marginLeft: '5px', cursor: 'pointer' }} icon="refresh" />}
					</span> }								
			</div>

			<div style={{  display: 'flex', justifyContent: 'right',  alignItems: 'center', width: '20%', marginRight: '10px' }} colspan={5}>
				{ login && <span className="navbar-text mr-1">{pr}</span> }
			 	{ login && <span className="navbar-text mr-1"> <FontAwesomeIcon icon={faMoneyBillAlt} /> {megabuckDisplay}</span> }
				<span className="navbar-text mr-1" > {!team ? <Link style={{color: 'white' }} to="/login">Sign In</Link> : team.name} </span>
				<audio ref={React.createRef()} src="./fifteen-minutes.ogg" autoPlay/>
		 		<TeamAvatar size={'xs'} code={!team ? null : team.code} />
			</div>
			<div colspan={2}/>
		</div>

// div style={{ border: "2px solid green", display: 'flex', height: '8vh',  justifyContent: 'center',  alignItems: 'center'  }}

		// <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
		// 	<Link className="navbar-brand" to={brandLink}>
		// 			<img src={nexus} alt='Project Nexus Logo' height='30px' />
		// 			Project Nexus
		// 	</Link>
		// 	<div className="collapse navbar-collapse" id="navbarNav" />
		// 		<div>
		// 			<Button>dwab</Button>
		// 		</div>
		// 		{ login && <Icon spin={loading} onClick={() => { clockRequested(); socket.emit('request', {route: 'clock', action:'getState'}); }} style={{ marginRight: '5px', cursor: 'pointer' }} icon="refresh" />}
		// 		{ login && <span className="navbar-text mr-md-5">{info.phase} {time} <FontAwesomeIcon icon={faClock} /> | {info.turnNum >= 0 ? `${info.turn} ${info.year}` : `${info.turn}`}</span> }
		// 		{ login && <span className="navbar-text mr-1">{pr}</span> }
		// 		{ login && <span className="navbar-text mr-1"> <FontAwesomeIcon icon={faMoneyBillAlt} /> {megabuckDisplay}</span> }
		// 		<span className="navbar-text mr-1"> {!team ? <Link to="/login">Sign In</Link> : team.name} </span>
		// 		<TeamAvatar size={'xs'} code={!team ? null : team.code} />
		// 	<div>
		// 		<audio ref={React.createRef()} src="./fifteen-minutes.ogg" autoPlay/></div>
		// </nav>
	)
};

const mapStateToProps = state => ({
    team: state.auth.team,
    login: state.auth.login,
		loading: state.entities.clock.loading,
		gameClock: state.entities.clock.gameClock,
		info: state.entities.clock.info,
		paused: state.entities.clock.paused,
		deadline: state.entities.clock.deadline,
		lastFetch: state.entities.clock.lastFetch,

    account: state.auth.team ? getTreasuryAccount(state) : undefined
});
  
const mapDispatchToProps = dispatch => ({
	clockRequested: (payload) => dispatch(clockRequested(payload)),
});
  
export default connect(mapStateToProps, mapDispatchToProps)(NavBar);