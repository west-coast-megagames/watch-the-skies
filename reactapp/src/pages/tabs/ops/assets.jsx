import React, { Component, Image, View } from 'react';
import { connect } from 'react-redux';
import { FlexboxGrid, Popover, Container, Whisper, Content, Alert, Sidebar,  IconButton, Icon, Panel, PanelGroup, List, Table } from 'rsuite';
import FacilityStats from '../../../components/common/facilityStats';
import MilitaryStats from '../../../components/common/militaryStats';
import ServiceRecord from '../../../components/common/serviceRecord';
import UpgradeTable from '../../../components/common/upgradeTable';
import { getOpsAccount } from '../../../store/entities/accounts';
import { getFacilites } from '../../../store/entities/facilities';
import { getMilitary } from '../../../store/entities/military';
import { getUpgrades } from '../../../store/entities/upgrades';

const { HeaderCell, Cell, Column } = Table;
class AssetTab extends Component {
	state = {
		unit: undefined,
		facility: undefined,
		upgrade: undefined
	}
	render() { 
		return (
			<Container>
				<Sidebar>
          <PanelGroup accordion >
						<Panel 
							bordered bodyFill header="Facilities" 
						>
							<List height={400} hover autoScroll>
								{this.props.facilities.map((facility, index) => (
									<List.Item key={index} index={index} onClick={() => this.setState({ facility, unit: undefined, upgrade: undefined })}>
										{facility.name}
									</List.Item>
								))}
							</List>
						</Panel>
						<Panel 
							bordered bodyFill header="Military Units"
						>
							<List height={400} hover autoScroll bordered>
								{this.props.units.map((unit, index) => (
									<List.Item key={index} index={index} onClick={() => this.setState({ unit, facility: undefined, upgrade: undefined })}>
										{unit.name}
									</List.Item>
								))}
							</List>
						</Panel>
						<Panel bordered bodyFill header="Upgrades">
							<List height={400} hover autoScroll bordered>
								{this.props.upgrades.map((upgrade, index) => (
									<List.Item key={index} index={index} onClick={() => this.setState({ upgrade, facility: undefined, unit: undefined })}>
										{upgrade.name}
									</List.Item>
								))}
							</List>
						</Panel>
          </PanelGroup>
        </Sidebar>
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
										src={'https://preview.redd.it/rgtrs9tube361.jpg?width=513&auto=webp&s=4c0d6ba5218ce19f7b4918e2ec27aa04ab26a3d1'} width="120" height="120" 
									/>									
							</FlexboxGrid.Item>
							<FlexboxGrid.Item colspan={12}>
								<p>
									<b>Name:</b> {this.state.upgrade.name}
								</p>
								<p>
									<b>Description:</b> {this.state.upgrade.desc}
								</p>
							</FlexboxGrid.Item>
						</FlexboxGrid>
						<Table height={300} data={this.state.upgrade.effects}>
							<Column verticalAlign='middle' flexGrow={2} align="left" fixed>
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
							<Column verticalAlign='middle' >
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
        </Container>
		);
	}	

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
	facilities: getFacilites(state)
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(AssetTab);