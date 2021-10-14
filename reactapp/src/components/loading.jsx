import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Progress, Loader, Panel, Icon, IconStack, Row, Col, Alert } from 'rsuite';
import { useHistory } from "react-router-dom";

import loadState from '../scripts/initState';
import { debugTeam, finishLoading, setControl } from '../store/entities/auth';

const { Line } = Progress

const LoadingPage = (props) => {
	const [message, setMessage] = React.useState('Scott quip goes here...');
	const [sections, setSections] = React.useState([]);
	
	let done = Object.keys(props.entities).sort().filter( key => props.entities[key].lastFetch !== null);
	const history = useHistory();

	useEffect(() => {
		setSections(Object.keys(props.entities).sort());
		loadState();
	}, []);

	if (Math.floor( done.length / sections.length * 100) >= 100) {
		const controlTeam = props.entities.teams.list.find(el => el.type === 'Control');
		let myTeam = undefined;
		for (let team of props.entities.teams.list) {
			if (team.users.some(el => el === props.appState.auth.user._id)) myTeam = team;
		}
		if (myTeam) {
			props.isControl(controlTeam.users.some(el => el === props.entities.auth))
			props.debugTeam(myTeam); // Forces your TEAM to USA
			props.finishLoading();
			history.push('/home');
		} else {
			Alert.error('You do not have an assigned team!', 1000);
			return (
				<div style={{ display: 'flex', justifyContent: 'center', }}>
					<h5>Could not find a team with id {props.appState.auth.user.username}</h5>
					{/* <img height={500} src='https://live.staticflickr.com/4782/40236389964_fe77df66a3_b.jpg' alt='failed to find team assigned'/> */}
					
				</div>
			)
		}
	} 

	return (
		<div>
			<Line percent={Math.floor( done.length / sections.length * 100)} status='active' />
			<hr />
			<Row>
				{sections.map(((section, index) =>
				<Col key={index} md={4} sm={8}>
					<Panel boardered key={index} index={index}>
						<IconStack>
							{ props.entities[section].lastFetch ? 
								<Icon icon="check" stack="1x" style={{ color: 'green' }} /> : 
								<Icon icon="spinner" stack="1x" pulse />
							}
						</IconStack>
						{section}
					</Panel>
					</Col>
				))}
			</Row>
			<Loader center content={`${message} - ${Math.floor( done.length / sections.length * 100)}%` } />
		</div>);
}

const mapStateToProps = (state) => ({
	appState: state,
	entities: state.entities
});

const mapDispatchToProps = dispatch => ({
  debugTeam: (payload) => dispatch(debugTeam(payload)),
	finishLoading: () => dispatch(finishLoading()),
	isControl: (payload) => dispatch(setControl(payload))
});

export default connect(mapStateToProps, mapDispatchToProps)(LoadingPage);