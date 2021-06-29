import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Progress, Loader, Panel, Icon, IconStack, Row, Col } from 'rsuite';
import { useHistory } from "react-router-dom";

import loadState from '../scripts/initState';
import { debugTeam } from '../store/entities/auth';

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
		props.debugTeam(props.entities.teams.list[0]);
		history.push('/home')
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
  debugTeam: (payload) => dispatch(debugTeam(payload))
});

export default connect(mapStateToProps, mapDispatchToProps)(LoadingPage);