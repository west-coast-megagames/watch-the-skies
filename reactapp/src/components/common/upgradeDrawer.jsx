import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Button, Alert, Table, Drawer, List, Popover, Whisper, Icon, IconButton, Panel, TagGroup, Tag, InputGroup, Input, CheckPicker } from 'rsuite';
import { getStored } from '../../store/entities/upgrades';
import socket from "../../socket";

const { HeaderCell, Cell, Column } = Table;

const UpgradeDrawer = (props) => {
	const [selected, setSelected] = React.useState([]);
	const [formatted, setFormatted] = React.useState([]);

	useEffect(() => {
		filterOptions();
	}, [props.uphrades]);

	
  const filterOptions = () => {
    let ups = [];
    for (let up of props.upgrades) {
			let effects = '';
			for (const effect of up.effects) {
				effects = effects.concat(` (${effect.type} + ${effect.effect})`)
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

	const whisperSelector = (rowData) => {
		let speak;
		let img;
		switch (rowData.type) {
			case 'attack':
				speak = (
					<Popover title="Attack Rating Information">
						<p>Attack is the power rating for the unit when it attacks.</p>
					</Popover>
				);
				break;
			case 'defense':
				speak = (
					<Popover title="Defense Rating Information">
						<p>
							Defense is the power rating for the unit when it is defending from an
							attack.
						</p>
					</Popover>
				);
				img = 'shield';
				break;
			default:
				speak = (
					<Popover title="Unkown">
						<p>
							Who knows what does. Better not touch it. Or maybe.... No. Best not. 
						</p>
					</Popover>
				);
		}
		return(
			<Whisper placement="top" speaker={speak} trigger="click">
			<IconButton size="xs" icon={<Icon icon="info-circle" />} />
		</Whisper>
		)
		}

	const handleSubmit = async (blueprint) => {
		try{
			socket.emit('request', { route: 'military', action: 'action', type: 'equip', data: { units: [ props.unit._id ], upgrades: selected }});
			
			// props.closeUpgrade()
		}
		catch (err) {
			Alert.error(`Error: ${err.body} ${err.message}`, 5000)
		}
	}

	const handleUps = (ups) => {
		setSelected(ups); 
	};

	return ( 
		<Drawer
			size='sm'  
			placement='right' 
			show={props.show} 
			onHide={() => props.closeUpgrade()}>
				<Drawer.Header>
					<Drawer.Title>Add an Upgrade from storage:</Drawer.Title>
				</Drawer.Header>
				<Drawer.Body>
					<div>
						<CheckPicker block placeholder='Select Upgrades'
								data={ formatted }
								onChange={handleUps}
								valueKey='value'
								labelKey='label'
								value={ selected }
						/>							
					</div>
					{selected.length > 0 && <div>
						Add the following:
						{selected.map((upgrade, index) => {
							let up = upgrade;
							if (!up.name) up = props.upgrades.find(el => el._id === upgrade); 

							return( // if the upgrade is not populated from the unit we gotta find
								<div style={{ border: "2px solid green", }}>
									<h5 style={{ margin: '5px' }}>{up.name} {up.status.map(tag => (<Tag color='blue' style={{ textTransform: 'capitalize' }}>{tag}</Tag>))}</h5>
									
									{up.effects.map(effect => (<p style={{ textTransform: 'capitalize', marginLeft: '15px',  marginTop: '5px', marginBottom: '5px'  }}>+{effect.effect}  {effect.type}</p>))}
								</div>
							) 
						})}
					</div>}


				</Drawer.Body>
				<Drawer.Footer>	
					<Button color="green" onClick={handleSubmit}>Add</Button>					
				</Drawer.Footer>

		</Drawer>
	 );
	
}
 
const mapStateToProps = state => ({
	upgrades: getStored(state),
	lastFetch: state.entities.upgrades.lastFetch
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(UpgradeDrawer);