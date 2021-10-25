import React, { Component } from 'react';
import { Button, ButtonGroup, Icon, Table, Tooltip, Whisper } from 'rsuite';
import { connect } from 'react-redux';
import socket from '../../../../socket';


const StatusBar = (props) => {
	const [displayLength, setDisplayLength] = React.useState(10);

	const handleControl = (type) => { 
		socket.emit('request', { route: 'military', action: 'reset', data: { id: props.unit._id, type  }});
	};

	let { status, name, actions, missions, model } = props.unit;
  return (
		<div >
		<ButtonGroup justified size='sm'>

			{status.some(el => el === 'mobilized') && model === 'Military' && <Whisper placement="top" speaker={<Tooltip>{name} is <b style={{ backgroundColor: 'green' }} >Mobilized!</b></Tooltip>} trigger="hover">
				{<Button onClick={() => props.control ? handleControl('mobilized') : console.log('nope')} style={{ cursor: 'help',  }} color='orange'><Icon icon="plane"/></Button>}
			</Whisper>}	

			{!status.some(el => el === 'mobilized') && model === 'Military' && <Whisper placement="top" speaker={<Tooltip>{name} is <b>Not Mobilized!</b></Tooltip>} trigger="hover">
				<Button onClick={() => props.control ? handleControl('mobilized') : console.log('nope')} style={{ cursor: 'help', color: 'grey'  }} appearance="ghost" color='orange' ><Icon icon="plane"/></Button>
			</Whisper>}

			{status.some(el => el === 'deployed') && model === 'Aircraft' && <Whisper placement="top" speaker={<Tooltip>{name} is <b style={{ backgroundColor: 'green' }} >on a Mission!</b></Tooltip>} trigger="hover">
				{<Button onClick={() => props.control ? handleControl('mobilized') : console.log('nope')} style={{ cursor: 'help',  }} color='orange'><Icon icon="plane"/></Button>}
			</Whisper>}	

			{!status.some(el => el === 'deployed') && model === 'Aircraft' && <Whisper placement="top" speaker={<Tooltip>{name} is <b>Not on a Mission!</b></Tooltip>} trigger="hover">
				<Button onClick={() => props.control ? handleControl('mobilized') : console.log('nope')} style={{ cursor: 'help', color: 'grey'  }} appearance="ghost" color='orange' ><Icon icon="plane"/></Button>
			</Whisper>}

			{actions > 0 && <Whisper placement="top" speaker={<Tooltip>{name}'s Action is <b style={{ backgroundColor: 'green' }} >Ready!</b></Tooltip>} trigger="hover">
				<Button color='blue' onClick={() => props.control ? handleControl('action') : console.log('nope')} style={{ cursor: 'help' }}><b>A</b></Button>
			</Whisper>}	
			{actions <= 0 && <Whisper placement="top" speaker={<Tooltip>{name}'s Action is <b style={{ backgroundColor: 'red' }} >Exhausted!</b></Tooltip>} trigger="hover">
				<Button color='blue' onClick={() => props.control ? handleControl('action') : console.log('nope')} appearance="ghost"  style={{ cursor: 'help', color: 'grey' }}><b>A</b></Button>
			</Whisper>}

			{missions > 0 && <Whisper placement="top" speaker={<Tooltip>{name}'s Mission is <b style={{ backgroundColor: 'green' }} >Ready!</b></Tooltip>} trigger="hover">
				<Button color='cyan' onClick={() => props.control ? handleControl('mission') : console.log('nope')} style={{ cursor: 'help' }}><b>M</b></Button>
			</Whisper>}	
			{missions <= 0 && <Whisper placement="top" speaker={<Tooltip>{name}'s Mission is <b style={{ backgroundColor: 'red' }} >Exhausted!</b></Tooltip>} trigger="hover">
				<Button color='cyan' appearance="ghost" onClick={() => props.control ? handleControl('mission') : console.log('nope')} style={{ cursor: 'help', color: 'grey' }}><b>M</b></Button>
			</Whisper>}
		</ButtonGroup>								
	</div> 
  );
    
}

const mapStateToProps = state => ({

})

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(StatusBar)