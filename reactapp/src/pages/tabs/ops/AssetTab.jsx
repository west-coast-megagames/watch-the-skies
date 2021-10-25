import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { FlexboxGrid, Popover, Container, Whisper, Content, Alert, Sidebar,  IconButton, Icon, Panel, PanelGroup, List, Table, TagGroup, Tag, Input, CheckboxGroup, Checkbox, CheckPicker, InputGroup } from 'rsuite';
import FacilityStats from '../../../components/common/facilityStats';
import ServiceRecord from '../../../components/common/serviceRecord';
import { getOpsAccount } from '../../../store/entities/accounts';
import { getFacilites } from '../../../store/entities/facilities';
import { getMilitary } from '../../../store/entities/military';
import { getUpgrades } from '../../../store/entities/upgrades';
import { socket } from '../../../api';
import MilitaryStats from './asset/militaryStats';
import UpgradeTable from './asset/upgradeTable';
import AircraftStats from './asset/AircraftStats';
import { getAircrafts } from '../../../store/entities/aircrafts';

const { HeaderCell, Cell, Column } = Table;

const AssetTab = (props) => {
	const [selected, setSelected] = React.useState(props.selected);
	const [filter, setFilter] = React.useState('');
	const [tags, setTags] = React.useState(['Military', 'Aircraft', 'Facilities', 'Upgrades' ]);
	const [military, setMilitary] = React.useState(true);
	const [facilites, setFacilities] = React.useState(true);
	const [upgrades, setUpgrades] = React.useState(true);
	const [aircraft, setAircraft] = React.useState(true);

	const listStyle = (item) => {
		if (selected && selected._id === item._id)
			return({backgroundColor: "#2196f3", cursor: 'pointer', color: 'white' });
		else
			return({cursor: 'pointer'});
	}


	useEffect(() => {
		if (props.units && selected) {
			const updated = props.units.find(el => el._id === selected._id);
			setSelected(updated);
		}
	}, [props.units]);

	const handleTags = (units) => {
		setTags(units);
	};


	const repair = async (upgrade) => {
		try {
			socket.emit( 'upgradeSocket', 'repair', { _id: upgrade._id });
		} catch (err) {
			console.log(err.response.data);
			Alert.error(`Error: ${err.response.data}`);
		}
	};

	const whisperSelector = (rowData) => {
		// console.log(rowData);
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
							Who knows what this does. Better not touch it. Or maybe.... No. Best not. 
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

	return (
		<Container style={{padddingRight: '0px', }}>
			<Content style={{ overflow: 'auto', height: 'calc(100vh - 100px)' }}>
        { !selected && <h4>Select an Asset</h4> }
				{ selected && selected.model === 'Military' && <React.Fragment>
						<MilitaryStats control={props.control} units={props.units} aircrafts={props.aircraft} unit={selected}/>
						<UpgradeTable unit={selected}/>
						<ServiceRecord owner={selected} />
				</React.Fragment>
				}
				{ selected && selected.model === 'Facility' && 
					<FacilityStats  control={props.control} facility={selected}/>
				}
				{ selected && selected.model === 'Aircraft' && 
					<AircraftStats control={props.control} units={props.units} aircrafts={props.aircraft} unit={selected}/>
				}
				{ selected && selected.model === 'Upgrade' && 
					<Panel>
					<FlexboxGrid>
						<FlexboxGrid.Item colspan={4}>
							<img
								src={'https://preview.redd.it/rgtrs9tube361.jpg?width=513&auto=webp&s=4c0d6ba5218ce19f7b4918e2ec27aa04ab26a3d1'} width="160" height="160" alt='Failed to Load'
							/>									
						</FlexboxGrid.Item>
						<FlexboxGrid.Item colspan={12}>
							<p>
								<b>Name:</b> {selected.name}
							</p>
							<p>
								<b>Description:</b> {selected.desc}
							</p>
							<p>
								<b>Status:</b>
							</p>									
								<TagGroup>
									{selected.status.some(el => el === 'damaged') && <Tag color='orange'>Damaged</Tag>}
									{selected.status.some(el => el === 'storage') && <Tag color='green'>Stored</Tag>}
									{!selected.status.some(el => el === 'storage') && <Tag color='violet'>Attached</Tag>}
									{selected.status.some(el => el === 'destroyed') && <Tag color='red'>Destroyed</Tag>}
									{selected.status.some(el => el === 'salvage') && <Tag color='blue'>Salvage</Tag>}
								</TagGroup>
							{selected.status.some(el => el === 'damaged') && <IconButton
									size="xs"
									onClick={() =>
										repair(selected)
									}
									icon={<Icon icon="wrench" />}
								>
									Repair
								</IconButton>}
						</FlexboxGrid.Item>
					</FlexboxGrid>
					<Table height={300} data={selected.effects}>
						<Column verticalAlign='middle' align="left" fixed>
							<HeaderCell>Type</HeaderCell>
							<Cell>
								{rowData => {
									switch (rowData.type) {
										case 'attack': 
											return (<b>Attack</b>)
										case 'defense': 
											return (<b>Defense</b>)
										case 'terror': 
											return (<b>Terror</b>)
										case 'pr': 
											return (<b>Public Relations (PR)</b>)
										default:
											return(<b>Unknown</b>)
									}
								}}
							</Cell>
						</Column>
						<Column verticalAlign='middle' align="center">
							<HeaderCell>Effect</HeaderCell>
							<Cell dataKey="effect" />
						</Column>
						<Column verticalAlign='middle' >
							<HeaderCell>Description</HeaderCell>
							<Cell>
							{rowData => {
                return whisperSelector(rowData)
              }}
							</Cell>
						</Column>
					</Table>
					</Panel>
				}
      </Content>
			<Sidebar>
					<PanelGroup>
						<Panel style={{ marginRight: '0', backgroundColor: "#262327", borderBottomLeftRadius: '0px', borderBottomRightRadius: '0px', borderTopRightRadius: '0px' }}>
							<InputGroup>
								<Input style={{ width: '60%' }} onChange={(value)=> setFilter(value)} placeholder="Search"></Input>
								<CheckPicker style={{ width: '40%', borderRadius: '0px',  }} placeholder='_'
									data={ checkerData }
									placement="bottomEnd"
									onChange={handleTags}
									valueKey='name'
									labelKey='name'
									searchable={false} 
									value={ tags }
							/>								
							</InputGroup>
						</Panel>
						<div bodyFill style={{ height: 'calc(100vh - 180px)', scrollbarWidth: 'none', overflow: 'auto', borderRadius: '0px', border: '1px solid #000000', textAlign: 'center' }}>
						{tags.some(el => el === 'Aircraft') && <List hover size='sm'>
								<h6 style={{ backgroundColor: '#413938', color: 'white' }}>Aircraft ({props.aircraft.filter(el => el.name.toLowerCase().includes(filter.toLowerCase())).length})</h6>
								{props.aircraft.filter(el => el.name.toLowerCase().includes(filter.toLowerCase())).map((upgrade, index) => (
									<List.Item key={index}  index={index} size={'md'} style={listStyle(upgrade)} onClick={()=> setSelected(upgrade)}>
										{upgrade.name}
									</List.Item>
								))}
							</List>}	
							
							
							{tags.some(el => el === 'Military') && <List hover autoScroll size='sm'>
								<h6 style={{ backgroundColor: '#413938', color: 'white' }}>Military Units ({props.units.filter(el => el.name.toLowerCase().includes(filter.toLowerCase())).length})</h6>
								{props.units.filter(el => el.name.toLowerCase().includes(filter.toLowerCase())).map((unit, index) => (
									<List.Item key={index}  index={index} size={'md'} style={listStyle(unit)} onClick={()=> setSelected(unit)} >
										{unit.name}
									</List.Item>
								))}
							</List>	}	

							{tags.some(el => el === 'Facilities') && <List hover size='sm'>
								<h6 style={{ backgroundColor: '#413938', color: 'white' }}>Facilities ({props.facilities.filter(el => el.name.toLowerCase().includes(filter.toLowerCase())).length})</h6>
								{props.facilities.filter(el => el.name.toLowerCase().includes(filter.toLowerCase())).map((facility, index) => (
									<List.Item key={index} index={index} size={'md'} style={listStyle(facility)} onClick={()=> setSelected(facility)}>
										{facility.name}
									</List.Item>
								))}
							</List>	}

							{tags.some(el => el === 'Upgrades') && <List hover size='sm'>
								<h6 style={{ backgroundColor: '#413938', color: 'white' }}>Upgrades ({props.upgrades.filter(el => el.name.toLowerCase().includes(filter.toLowerCase())).length})</h6>
								{props.upgrades.filter(el => el.name.toLowerCase().includes(filter.toLowerCase())).map((upgrade, index) => (
									<List.Item key={index}  index={index} size={'md'} style={listStyle(upgrade)} onClick={()=> setSelected(upgrade)}>
										{upgrade.name}
									</List.Item>
								))}
							</List>}	

							{tags.length === 0 && <div>
								Nothing selected...
							</div>}			
						</div>
					</PanelGroup>
        </Sidebar>
    </Container>
	);
}



const attackSpeaker = (
  <Popover title="Attack Rating Information">
    <p>Attack is the power rating for the unit when it attacks.</p>
  </Popover>
);

const defenseSpeaker = (
  <Popover title="Defense Rating Information">
    <p>
      Defense is the power rating for the unit when it is defending from an
      attack.
    </p>
  </Popover>
);

const checkerData = [
	{
		name: 'Aircraft'
	},
	{
		name: 'Military'
	},
	{
		name: 'Facilities'
	},
	{
		name: 'Upgrades'
	},
]



const mapStateToProps = (state, props)=> ({
	login: state.auth.login,
	team: state.auth.team,
	teams: state.entities.teams.list,
	account: getOpsAccount(state),
	aircraft: props.control ? state.entities.aircrafts.list : getAircrafts(state),
	units: props.control ? state.entities.military.list : getMilitary(state),
	upgrades: props.control ? state.entities.upgrades.list : getUpgrades(state),
	facilities: props.control ? state.entities.facilities.list : getFacilites(state),
	lastFetch: state.entities.military.lastFetch
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(AssetTab);