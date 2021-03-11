import React, { Component, Image, View } from 'react';
import { connect } from 'react-redux';
import { FlexboxGrid, Popover, Container, Whisper, Content, Alert, Sidebar,  IconButton, Icon, Panel, PanelGroup, List, Table, TagGroup, Tag, Input } from 'rsuite';
import FacilityStats from '../../../components/common/facilityStats';
import MilitaryStats from '../../../components/common/militaryStats';
import ServiceRecord from '../../../components/common/serviceRecord';
import UpgradeTable from '../../../components/common/upgradeTable';
import { getOpsAccount } from '../../../store/entities/accounts';
import { getFacilites } from '../../../store/entities/facilities';
import { getMilitary } from '../../../store/entities/military';
import { getUpgrades } from '../../../store/entities/upgrades';

import axios from 'axios';
import { gameServer } from '../../../config';

const { HeaderCell, Cell, Column } = Table;

/* 
This Components gets passed 
*/
class AssetTab extends Component {
	state = {
		unit: undefined,
		facility: undefined,
		upgrade: undefined,
		filter: ''
	}

	componentDidUpdate(prevProps, prevState) {
    if (prevProps.lastFetch !== this.props.lastFetch) {
			if(this.state.unit) {
				let unit = this.props.units.find(el => el._id === this.state.unit._id);
				this.setState({ unit });
			}
			else if (this.state.upgrade) {
				let upgrade = this.props.upgrades.find(el => el._id === this.state.upgrade._id);
				this.setState({ upgrade });
			}
		}
		// add in conditions to update the list with new/removed elements, calling create List
	}

	render() { 
		return (
			<Container style={{padddingRight: '0px', overflow: 'auto', height: 'calc(100vh)'}}>
				<Content>
          { !this.state.unit && !this.state.facility && !this.state.upgrade && <h4>Select an Asset</h4> }
					{ this.state.unit && <React.Fragment>
							<MilitaryStats unit={this.state.unit} />
							<UpgradeTable unit={this.state.unit}/>
							<ServiceRecord owner={this.state.unit} />
					</React.Fragment>
					}
					{ this.state.facility && 
						<FacilityStats facility={this.state.facility}/>
					}
					{ this.state.upgrade && 
						<Panel>
						<FlexboxGrid>
							<FlexboxGrid.Item colspan={4}>
								<img
									src={'https://preview.redd.it/rgtrs9tube361.jpg?width=513&auto=webp&s=4c0d6ba5218ce19f7b4918e2ec27aa04ab26a3d1'} width="160" height="160" 
								/>									
							</FlexboxGrid.Item>
							<FlexboxGrid.Item colspan={12}>
								<p>
									<b>Name:</b> {this.state.upgrade.name}
								</p>
								<p>
									<b>Description:</b> {this.state.upgrade.desc}
								</p>
								<p>
									<b>Status:</b>
								</p>									
									<TagGroup>
										{this.state.upgrade.status.damaged && <Tag color='orange'>Damaged</Tag>}
										{this.state.upgrade.status.storage && <Tag color='green'>Stored</Tag>}
										{!this.state.upgrade.status.storage && <Tag color='violet'>Attached</Tag>}
										{this.state.upgrade.status.destroyed && <Tag color='red'>Destroyed</Tag>}
										{this.state.upgrade.status.salvage && <Tag color='blue'>Salvage</Tag>}
									</TagGroup>
								{this.state.upgrade.status.damaged && <IconButton
										size="xs"
										onClick={() =>
											this.repair(this.state.upgrade)
										}
										icon={<Icon icon="wrench" />}
									>
										Repair
									</IconButton>}
							</FlexboxGrid.Item>
						</FlexboxGrid>
						<Table height={300} data={this.state.upgrade.effects}>
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
                  return this.whisperSelector(rowData)
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
							<Input onChange={(value)=> this.setState({filter: value})} placeholder="Search"></Input>
						</Panel>
						<Panel bodyFill style={{ height: 'calc(100vh - 180px)', scrollbarWidth: 'none', overflow: 'auto', borderRadius: '0px', border: '1px solid #000000', textAlign: 'center' }}>
							<List hover autoScroll size='sm'>
								<h6 style={{ backgroundColor: '#413938', color: 'white' }}>Military Units</h6>
								{this.props.units.filter(el => el.name.toLowerCase().includes(this.state.filter.toLowerCase())).map((unit, index) => (
									<List.Item key={index}  index={index} size={'md'} style={this.listStyle(unit)} onClick={()=> this.setState({unit, facility: undefined, upgrade: undefined})} >
										{unit.name}
									</List.Item>
								))}
							</List>		

							<List hover size='sm'>
								<h6 style={{ backgroundColor: '#413938', color: 'white' }}>Facilities</h6>
								{this.props.facilities.filter(el => el.name.toLowerCase().includes(this.state.filter.toLowerCase())).map((facility, index) => (
									<List.Item key={index} index={index} size={'md'} style={this.listStyle(facility)} onClick={()=> this.setState({facility, unit: undefined, upgrade: undefined})}>
										{facility.name}
									</List.Item>
								))}
							</List>	

							<List hover size='sm'>
								<h6 style={{ backgroundColor: '#413938', color: 'white' }}>Upgrades</h6>
								{this.props.upgrades.filter(el => el.name.toLowerCase().includes(this.state.filter.toLowerCase())).map((upgrade, index) => (
									<List.Item key={index}  index={index} size={'md'} style={this.listStyle(upgrade)} onClick={()=> this.setState({upgrade, facility: undefined, unit: undefined})}>
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

	listStyle (item) {
		if (this.state.unit && this.state.unit._id === item._id)
			return({backgroundColor: "#2196f3", cursor: 'pointer', color: 'white' });
		else if (this.state.facility && this.state.facility._id === item._id)
			return({backgroundColor: "#2196f3", cursor: 'pointer', color: 'white'});
		if (this.state.upgrade && this.state.upgrade._id === item._id)
			return({backgroundColor: "#2196f3", cursor: 'pointer', color: 'white'});
		else
			return({cursor: 'pointer'});
	}


	repair = async (upgrade) => {
		try {
			let response = await axios.put(`${gameServer}game/upgrades/repair`, {
				_id: upgrade._id,
			});
			Alert.success(response.data);
		} catch (err) {
			console.log(err.response.data);
			Alert.error(`Error: ${err.response.data}`);
		}
	};

	whisperSelector = (rowData) => {
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