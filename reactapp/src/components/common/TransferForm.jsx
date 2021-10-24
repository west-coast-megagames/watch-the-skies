import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Button, Alert, Table, Drawer, List, Popover, Whisper, Icon, IconButton, Panel, ButtonGroup, CheckPicker } from 'rsuite';
import { gameServer } from '../../config';
import { getStored } from '../../store/entities/upgrades';
import axios from 'axios';
import { getFacilites } from '../../store/entities/facilities';
import socket from '../../socket';

const { HeaderCell, Cell, Column } = Table;

const TransferForm = (props) => {
	const [units, setUnits] = React.useState([]); 
	const [selected, setSelected] = React.useState(null); 
	const [transferFleets, setTransferFleets] = React.useState([]); 
	const [transferCorps, setTransferCorps] = React.useState([]); 
	const [aircraft, setAircraft] = React.useState([]); 

	useEffect(() => {
		console.log(props.unit)
		filterUnits();
		setUnits([props.unit])
		}, [])

	const filterUnits = (value) => {
		console.log('Filtering Units...')
		if (selected) { // console.log('Filtering Units...')
			let transferFleets = [];
			let transferCorps = [];
			let transferAir = [];

			for (let unit of props.units) {
				let unitData = {
					name: unit.name,
					checkZone: unit.site.name,
					info: `${unit.name} - Hlth: ${unit.stats.health}/${unit.stats.healthMax} | Atk: ${unit.stats.attack} | Def: ${unit.stats.defense} | Upgrades: ${unit.upgrades.length}`,
					_id: unit._id
				}
				if (unit.type === 'Fleet' && !unit.status.some(el => el === 'mobilized') && unit.actions > 0) transferFleets.push(unitData);
				if (unit.type === 'Corps' && !unit.status.some(el => el === 'mobilized') && unit.actions > 0) transferCorps.push(unitData);
			}

			for (let unit of props.aircrafts) {
				let unitData = {
					name: unit.name,
					checkZone: unit.site.name,
					info: `${unit.name} - Hlth: ${unit.stats.health}/${unit.stats.healthMax} | Atk: ${unit.stats.attack} | Upgrades: ${unit.upgrades.length}`,
					_id: unit._id
				}
				if (!unit.status.some(el => el === 'mobilized') && unit.actions > 0) transferAir.push(unitData);
			}

			setTransferFleets(transferFleets);
			setTransferCorps(transferCorps);
			setAircraft(transferAir);

			if (props.unit) {
				const combined = [ ...transferFleets, ...transferCorps, ...transferAir ]
				const found = combined.find(el => el._id === props.unit._id);
				setUnits([found._id]);
			}
		}
	}

	const handleSubmit = async () => {
		try{
			socket.emit('request', { route: 'military', action: 'transfer', data: { destination: selected._id, units }});
			props.closeTransfer()
		}
		catch (err) {
			Alert.error(`Error: ${err.body} ${err.message}`, 5000)
		}
	}

	const handleFacility = (facility) => {
		console.log(facility)
		setSelected(facility);
		filterUnits()
	}

	return ( 
		<Drawer
			size='sm'  
			placement='right' 
			show={props.show} 
			onHide={() => props.closeTransfer()}>
				<Drawer.Header>
					<Drawer.Title>Transfer to a Facility:</Drawer.Title>
				</Drawer.Header>
				<Drawer.Body>
					{<Panel bodyFill >
						<List hover autoScroll bordered style={{scrollbarWidth: 'none', textAlign: 'center', cursor: 'pointer' }}>
							{props.facilities.map((facility, index) => (
								<List.Item key={index} index={index} onClick={() => handleFacility(facility)}>
									{facility.name} | {facility.site.name}
								</List.Item>
							))}
						</List>							
					</Panel>}
					{selected && <CheckPicker block placeholder='Select Units'
							data={ selected.tags.some(el => el === 'coastal') ? [...transferFleets, ...transferCorps, ...aircraft] : [...transferCorps, ...aircraft ] }
							onChange={(units) => setUnits(units)}
							valueKey='_id'
							labelKey='name'
							groupBy='checkZone'
							value={ units }
						/>}
					{selected && <React.Fragment>
					 <h4>{selected.name}</h4>
					 <b>Transfer {props.unit.name} to Facility {selected.name}?</b>
				 </React.Fragment>}
				</Drawer.Body>
				<Drawer.Footer>
					<ButtonGroup>
						<Button color="red"  onClick={() => setSelected(null)}>Reselect</Button>		
						<Button color="green"  onClick={handleSubmit}>Transfer</Button>							 
					 </ButtonGroup>
				</Drawer.Footer>
		</Drawer>
	 );
	
}
 
const mapStateToProps = state => ({
	facilities: getFacilites(state),
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(TransferForm);