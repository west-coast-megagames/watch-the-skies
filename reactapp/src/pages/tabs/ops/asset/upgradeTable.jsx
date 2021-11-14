import React, { useEffect } from 'react';
import { Container, Content, Icon, Table, Button, Alert, Panel, IconButton, ButtonToolbar, ButtonGroup, Checkbox, Popover, Whisper } from 'rsuite';
import UpgradeDrawer from '../../../../components/common/upgradeDrawer';
import socket from '../../../../socket';

const { HeaderCell, Cell, Column } = Table;

const UpgradeTable = (props) => {
	const [edit, setEdit] = React.useState(false);
	const [showUpgrade, setShowUpgrade] = React.useState(false);
	const [upgrades, setUpgrades] = React.useState([]);



const handleRemove = () => {
	try {
		socket.emit('request', { route: props.unit.model.toLowerCase(), action: 'action', type: 'unequip', data: { units: [ props.unit._id ], aircrafts: [ props.unit._id ], upgrades }});
	}
	catch (err) {
		Alert.error(`Error: ${err.body} ${err.message}`, 5000)
	}
}

return (
	<div>
		<Panel bordered>
		<h5 style={{ textAlign: 'center' }}>Upgrades ({props.upArray.length}) 
			<ButtonGroup>
				{!edit && 						
					<Whisper placement="top" speaker={editSpeaker} trigger="hover">
						<IconButton disabled={props.upArray.length === 0} color='blue' size='sm' icon={<Icon icon="wrench" />} onClick={() => setEdit(!edit)}></IconButton>
					</Whisper>}
				{edit && 
					<Whisper placement="top" speaker={cancelSpeaker} trigger="hover">
						<Button color='red' size='sm' onClick={() => setEdit(!edit)}><b>X</b></Button>
					</Whisper>}	
				{edit && 
					<Whisper placement="top" speaker={submitSpeaker} trigger="hover">
						<IconButton disabled={upgrades.length === 0} color='orange' size='sm' icon={<Icon icon="send" />} onClick={() => handleRemove()}></IconButton>
					</Whisper>}				
			</ButtonGroup>
		</h5>
		{!edit && <b style={{ color: 'white' }}>Bazinga</b>}
		{edit && <b>Select Upgrades to remove</b>}
		{props.upArray.map((upgrade, index) => {
			let up = upgrade;
			if (!up.name) up = props.upgrades.find(el => el._id === upgrade); 
			
			return( // if the upgrade is not populated from the unit we gotta find
				<div style={{ border: "1px solid black", display: 'flex', height: '8vh' }}>
					{edit && <Checkbox checked={upgrades.some(el => el === up._id)} 
					onClick={() => {
						if(upgrades.some(el => el === up._id)) {
							const index = upgrades.findIndex(el => el === up._id);
							const temp =  [ ...upgrades ];
							temp.splice(index, 1);
							setUpgrades(temp);
						}
						else {
							setUpgrades([ ...upgrades, up._id ]);
						}
						// setUpgrades([up])
						}} 
						/>}
					<div>
						<h5 style={{ margin: '5px' }}>{up.name}</h5>
						{up.effects.map(effect => (<b style={{ textTransform: 'capitalize', marginLeft: '15px',  marginTop: '5px', marginBottom: '5px'  }}>+{effect.effect}  {effect.type}</b>))}						
					</div>

				</div>
			) 
		})}
		<div style={{ border: "1px solid black", display: 'flex', height: '8vh',  justifyContent: 'center',  alignItems: 'center'  }}>
			<Whisper placement="top" speaker={addSpeaker} trigger="hover">
				<IconButton disabled={edit} color='green' size='sm' icon={<Icon icon="plus" />} onClick={() => setShowUpgrade(true)}></IconButton>
			</Whisper>
		</div>
		</Panel>	
		{<UpgradeDrawer show={showUpgrade}
				closeUpgrade={()=> setShowUpgrade(!showUpgrade)}
				unit={props.unit}
				upgrades={props.upgrades}
			/>}	
	</div>

);
}

const editSpeaker = (
  <Popover title="Edit">
    <p>
      Remove upgrades
    </p>
  </Popover>
);

const cancelSpeaker = (
  <Popover title="Cancel">
  </Popover>
);

const addSpeaker = (
  <Popover title="Add">
    <p>
      Add upgrades
    </p>
  </Popover>
);

const submitSpeaker = (
  <Popover title="Submit">
		Must select at least one upgrade
  </Popover>
);

 

export default UpgradeTable;