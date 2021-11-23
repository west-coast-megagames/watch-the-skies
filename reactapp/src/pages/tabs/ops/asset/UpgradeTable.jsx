import React, { useEffect } from 'react';
import { Container, Content, Icon, Table, Button, Alert, Panel, IconButton, ButtonToolbar, ButtonGroup, Checkbox, Popover, Whisper, SelectPicker, Tag } from 'rsuite';
import UpgradeDrawer from '../../../../components/common/upgradeDrawer';
import socket from '../../../../socket';

const { HeaderCell, Cell, Column } = Table;

const UpgradeTable = (props) => {
	const [edit, setEdit] = React.useState(false);
	const [showUpgrade, setShowUpgrade] = React.useState(false);
	const [upgrades, setUpgrades] = React.useState([]);
	const [selected, setSelected] = React.useState([]);
	const [formatted, setFormatted] = React.useState([]);

	useEffect(() => {
		filterOptions();
	}, [props.uprades]);

	
  const filterOptions = () => {
    let ups = [];
    for (let up of props.upgrades) {
			let effects = '';
			for (const effect of up.effects) {
				effects = effects.concat(` (${effect.type} + ${effect.value})`)
			}
      //console.log(up)
      let data = { 
        name: up.name,
				effects,
				label: `${up.name} - ${effects}`,
        value: up._id
      }
      ups.push(data);
    }
    setFormatted(ups);

  }

	const handleSubmit = async () => {
		try{
			socket.emit('request', { route: props.unit.model.toLowerCase(), action: 'action', type: 'equip', data: { units: [ props.unit._id ], aircrafts: [ props.unit._id ], upgradesAdd: selected, upgradesRemove: upgrades }});
			setSelected([]);
			setUpgrades([]);
			setEdit(false);
			// props.closeUpgrade()
		}
		catch (err) {
			Alert.error(`Error: ${err.body} ${err.message}`, 5000)
		}
	}

	const handleUps = (ups) => {
		let temp = [ ...selected ];
		temp.push(ups)
		setSelected(temp); 
		setShowUpgrade(false)
	};

	const handleRemove = (up) => {
		let temp = [ ...selected ];
		const index = temp.findIndex(el => el === up);
		temp.splice(index, 1);
		setSelected(temp); 
	};


return (
	<div>
		<Panel bordered>
		<h5 style={{ textAlign: 'center' }}>Upgrades ({props.upArray.length}) 
			<ButtonGroup>
				{!edit && 						
					<Whisper placement="top" speaker={editSpeaker} trigger="hover">
						<IconButton disabled={(props.unit.missions + props.unit.actions) <= 0} color='blue' size='sm' icon={<Icon icon="wrench" />} onClick={() => setEdit(!edit)}></IconButton>
					</Whisper>}
				{edit && 
					<Whisper placement="top" speaker={cancelSpeaker} trigger="hover">
						<Button color='red' size='sm' onClick={() => setEdit(!edit)}><b>X</b></Button>
					</Whisper>}	
				{edit && 
					<Whisper placement="top" speaker={submitSpeaker} trigger="hover">
						<IconButton disabled={upgrades.length + selected.length === 0} color='orange' size='sm' icon={<Icon icon="send" />} onClick={() => handleSubmit()}></IconButton>
					</Whisper>}				
			</ButtonGroup>
		</h5>
		{!edit && <b style={{ color: 'white' }}>Bazinga</b>}
		{edit && <b>Select Upgrades to remove</b>}
		{props.upArray.map((upgrade, index) => {
			let up = upgrade;
			if (!up.name) up = props.upgrades.find(el => el._id === upgrade); 
			
			return(
				<div style={{ border: "2px solid black", display: 'flex', height: '8vh' }}>
					{edit && 
					<Whisper placement="top" speaker={removeSpeaker} trigger="hover">
						<Checkbox checked={upgrades.some(el => el === up._id)} 
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
							/>						
					</Whisper>}
					<div>
						<h5 style={{ margin: '5px' }}>{up.name}</h5>
						{up.effects.map(effect => (<b style={{ textTransform: 'capitalize', marginLeft: '15px',  marginTop: '5px', marginBottom: '5px'  }}>+{effect.value}  {effect.type}</b>))}						
					</div>

				</div>
			) 
		})}

		{selected && selected.length > 0 && <div>
			Add the following:
			{selected.map((upgrade, index) => {
				let up = upgrade;
				if (!up.name) up = props.upgrades.find(el => el._id === upgrade); 
				return( // if the upgrade is not populated from the unit we gotta find
					<div index={index} style={{ border: "2px solid green", display: 'flex', height: '8vh' }}>
						<Button style={{ height: '3vh', margin: '5px' }} color='red' size='sm' onClick={() => handleRemove(up._id)}><b>X</b></Button>
						<div>
							<h5 style={{ margin: '5px' }}>{up.name} {up.status.map(tag => (<Tag color='blue' style={{ textTransform: 'capitalize' }}>{tag}</Tag>))}</h5>			
							{up.effects.map(effect => (<b style={{ textTransform: 'capitalize', marginLeft: '15px',  marginTop: '5px', marginBottom: '5px'  }}>+{effect.value}  {effect.type}</b>))}
						</div>
					</div>
				) 
			})}
		</div>}

		{edit && <div style={{ border: "2px solid green", display: 'flex', height: '8vh',  justifyContent: 'center',  alignItems: 'center'  }}>
			{!showUpgrade && <Whisper placement="top" speaker={addSpeaker} trigger="hover">
				<IconButton color='green' size='sm' icon={<Icon icon="plus" />} onClick={() => setShowUpgrade(true)}></IconButton>
			</Whisper>}
			{showUpgrade && <SelectPicker style={{ width: '70%' }} block placeholder='Select Upgrade to Add'
				data={ formatted }
				onChange={handleUps}
				valueKey='value'
				labelKey='label'
				value={ selected }
			/>	}
		</div>}
		</Panel>	
		{/* {<UpgradeDrawer show={showUpgrade}
				closeUpgrade={()=> setShowUpgrade(!showUpgrade)}
				unit={props.unit}
				upgrades={props.upgrades}
			/>}	 */}
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

const removeSpeaker = (
  <Popover title="Remove">
    <p>
      Remove this upgrade
    </p>
  </Popover>
);

const submitSpeaker = (
  <Popover title="Submit">
		Must select at least one upgrade
  </Popover>
);

 

export default UpgradeTable;
