import React, { useEffect } from 'react';
import { Container, Content, Icon, Table, Button, Alert, Panel, IconButton, ButtonToolbar, ButtonGroup, Checkbox } from 'rsuite';
import UpgradeDrawer from '../../../../components/common/upgradeDrawer';
import socket from '../../../../socket';

const { HeaderCell, Cell, Column } = Table;

const UpgradeTable = (props) => {
	const [edit, setEdit] = React.useState(false);
	const [showUpgrade, setShowUpgrade] = React.useState(false);
	const [upgrades, setUpgrades] = React.useState([]);



const handleRemove = () => {
	try {
		socket.emit('request', { route: 'military', action: 'action', type: 'unequip', data: { units: [ props.unit._id ], upgrades }});
	}
	catch (err) {
		Alert.error(`Error: ${err.body} ${err.message}`, 5000)
	}
}

return (
	<div>
		<Panel bordered>
		<h5 style={{ textAlign: 'center' }}>Upgrades 
			<ButtonToolbar>
				<ButtonGroup>
					<IconButton color='green' size='sm' icon={<Icon icon="plus" />} onClick={() => setShowUpgrade(true)}></IconButton>		
					{!edit && <IconButton color='blue' size='sm' icon={<Icon icon="wrench" />} onClick={() => setEdit(!edit)}></IconButton>}
					{edit && <IconButton color='red' size='sm' icon={<Icon icon="exit" />} onClick={() => setEdit(!edit)}></IconButton>}	
					{edit && <IconButton color='orange' size='sm' icon={<Icon icon="send" />} onClick={() => handleRemove()}></IconButton>}				
				</ButtonGroup>
			</ButtonToolbar>
		</h5>
		{props.upArray.length === 0 && <b>No Upgrades equipped</b>}
		{props.upArray.map((upgrade, index) => {
			let up = upgrade;
			if (!up.name) up = props.upgrades.find(el => el._id === upgrade); 
			
			return( // if the upgrade is not populated from the unit we gotta find
				<div style={{ border: "1px solid black", display: 'flex' }}>
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
						<h5 style={{ margin: '5px' }}>{up.name}</h5>{up._id}
						{up.effects.map(effect => (<p style={{ textTransform: 'capitalize', marginLeft: '15px',  marginTop: '5px', marginBottom: '5px'  }}>+{effect.effect}  {effect.type}</p>))}						
					</div>

				</div>
			) 
		})}
		</Panel>	
		{<UpgradeDrawer show={showUpgrade}
				closeUpgrade={()=> setShowUpgrade(!showUpgrade)}
				unit={props.unit}
				upgrades={props.upgrades}
			/>}	
	</div>

);
	
}
 

export default UpgradeTable;