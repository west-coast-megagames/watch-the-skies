import React, { useEffect } from 'react';
import socket from '../socket';
import { Button, ButtonGroup, ButtonToolbar, IconButton, Icon, Alert } from 'rsuite';
import { connect } from 'react-redux';

const ClockControls = ({paused}) => {
	const [clock, setClock] = React.useState({ clock: '00:00', hours: 0, minutes: 0, seconds: 0, });
	const [deadline, setDeadline] = React.useState(Date.now());
	const [info, setInfo] = React.useState({ phase: 'Test Phase', turn:  'Test Turn', turnNum: 0, year: 2021 });

	useEffect(() => {
		socket.emit('request', {route: 'clock', action:'getState'})
	}, []);

	return (
		<ButtonToolbar>
			<ButtonGroup>
				<IconButton icon={ <Icon icon='step-backward' />} onClick={ () => socket.emit('request', { route: 'clock', action: 'revert'}) } />
				<IconButton disabled={paused} icon={ <Icon icon='pause' />} onClick={ () => { socket.emit('request', { route: 'clock', action: 'pause'}); Alert.success('woo')}} />
				<IconButton disabled={!paused} icon={ <Icon icon='play' />} onClick={ () => { socket.emit('request', { route: 'clock', action: 'play'}); Alert.success('woo')} } />
				<IconButton icon={ <Icon icon='step-forward' />} onClick={ () => socket.emit('request', { route: 'clock', action: 'skip'}) } />
			</ButtonGroup>
			<Button icon={ <Icon icon='play' />} onClick={ () => socket.emit('request', { route: 'clock', action: 'reset'}) }>Reset</Button>
		</ButtonToolbar>
	)
}

const mapStateToProps = state => ({
	gameClock: state.entities.clock.gameClock,
	info: state.entities.clock.info,
	paused: state.entities.clock.paused,
	deadline: state.entities.clock.deadline,
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ClockControls);