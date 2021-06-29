import React, { useEffect } from 'react';
import socket from '../socket';
import { Button, ButtonGroup, ButtonToolbar, IconButton, Icon, Alert } from 'rsuite';

const ClockControls = () => {
	const [clock, setClock] = React.useState({ clock: '00:00', hours: 0, minutes: 0, seconds: 0, });
	const [deadline, setDeadline] = React.useState(Date.now());
	const [info, setInfo] = React.useState({ phase: 'Test Phase', turn:  'Test Turn', turnNum: 0, year: 2021 });
	const [paused, setPaused] = React.useState(true);

	useEffect(() => {
		socket.on('clock', (data) => {
			const { paused } = data;
			setPaused(paused)
			console.log(data);
		})
		socket.emit('request', {route: 'clock', action:'getState'})
		return () => socket.off('clock');
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

export default ClockControls;