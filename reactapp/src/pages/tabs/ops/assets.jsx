import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { FlexboxGrid, Popover, Container, Whisper, Content, Alert, Sidebar,  IconButton, Icon, Panel, PanelGroup, List, Table, TagGroup, Tag, Input } from 'rsuite';
import FacilityStats from '../../../components/common/facilityStats';
import ServiceRecord from '../../../components/common/serviceRecord';
import { getOpsAccount } from '../../../store/entities/accounts';
import { getFacilites } from '../../../store/entities/facilities';
import { getMilitary } from '../../../store/entities/military';
import { getUpgrades } from '../../../store/entities/upgrades';
import { socket } from '../../../api';
import MilitaryStats from './asset/militaryStats';
import UpgradeTable from './asset/upgradeTable';

const { HeaderCell, Cell, Column } = Table;

const AssetTab = (props) => {
	const [selected, setSelected] = React.useState(undefined);
	const [filter, setFilter] = React.useState('');

	const listStyle = (item) => {
		if (selected && selected._id === item._id)
			return({backgroundColor: "#2196f3", cursor: 'pointer', color: 'white' });
		else
			return({cursor: 'pointer'});
	}


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
		<Container style={{padddingRight: '0px', overflow: 'auto', height: 'calc(100vh)'}}>
			<Content>
        { !selected && <h4>Select an Asset</h4> }
				{ selected && selected.model === 'Military' && <React.Fragment>
						<MilitaryStats unit={selected}/>
						<UpgradeTable unit={selected}/>
						<ServiceRecord owner={selected} />
				</React.Fragment>
				}
				{ selected && selected.model === 'Facility' && 
					<FacilityStats facility={selected}/>
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
									{selected.status.damaged && <Tag color='orange'>Damaged</Tag>}
									{selected.status.storage && <Tag color='green'>Stored</Tag>}
									{!selected.status.storage && <Tag color='violet'>Attached</Tag>}
									{selected.status.destroyed && <Tag color='red'>Destroyed</Tag>}
									{selected.status.salvage && <Tag color='blue'>Salvage</Tag>}
								</TagGroup>
							{selected.status.damaged && <IconButton
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
							<Input onChange={(value)=> setFilter(value)} placeholder="Search"></Input>
						</Panel>
						<Panel bodyFill style={{ height: 'calc(100vh - 180px)', scrollbarWidth: 'none', overflow: 'auto', borderRadius: '0px', border: '1px solid #000000', textAlign: 'center' }}>
							<List hover autoScroll size='sm'>
								<h6 style={{ backgroundColor: '#413938', color: 'white' }}>Military Units</h6>
								{props.units.filter(el => el.name.toLowerCase().includes(filter.toLowerCase())).map((unit, index) => (
									<List.Item key={index}  index={index} size={'md'} style={listStyle(unit)} onClick={()=> setSelected(unit)} >
										{unit.name}
									</List.Item>
								))}
							</List>		

							<List hover size='sm'>
								<h6 style={{ backgroundColor: '#413938', color: 'white' }}>Facilities</h6>
								{props.facilities.filter(el => el.name.toLowerCase().includes(filter.toLowerCase())).map((facility, index) => (
									<List.Item key={index} index={index} size={'md'} style={listStyle(facility)} onClick={()=> setSelected(facility)}>
										{facility.name}
									</List.Item>
								))}
							</List>	

							<List hover size='sm'>
								<h6 style={{ backgroundColor: '#413938', color: 'white' }}>Upgrades</h6>
								{props.upgrades.filter(el => el.name.toLowerCase().includes(filter.toLowerCase())).map((upgrade, index) => (
									<List.Item key={index}  index={index} size={'md'} style={listStyle(upgrade)} onClick={()=> setSelected(upgrade)}>
										{upgrade.name}
									</List.Item>
								))}
							</List>						
						</Panel>
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


const mapStateToProps = state => ({
	login: state.auth.login,
	team: state.auth.team,
	teams: state.entities.teams.list,
	account: getOpsAccount(state),
	units: getMilitary(state),
	upgrades: getUpgrades(state),
	facilities: getFacilites(state),
	lastFetch: state.entities.military.lastFetch
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(AssetTab);