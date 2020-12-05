import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Content, Alert, Sidebar,  IconButton, Icon, Panel, PanelGroup, List } from 'rsuite';
import FacilityStats from '../../../components/common/facilityStats';
import MilitaryStats from '../../../components/common/militaryStats';
import ServiceRecord from '../../../components/common/serviceRecord';
import UpgradeTable from '../../../components/common/upgradeTable';
import { getOpsAccount } from '../../../store/entities/accounts';
import { getFacilites } from '../../../store/entities/facilities';
import { getMilitary } from '../../../store/entities/military';

class AssetTab extends Component {
	state = {
		unit: undefined,
		facility: undefined,
	}
	render() { 
		return (
			<Container>
				<Content>
          { !this.state.unit && !this.state.facility && <h4>I didn't create a any content... so sorry...</h4> }
					{ this.state.unit && <React.Fragment>
							<MilitaryStats unit={this.state.unit} />
							<UpgradeTable unit={this.state.unit}/>
							<ServiceRecord owner={this.state.unit} />
					</React.Fragment>
					}
					{ this.state.facility && 
						<FacilityStats facility={this.state.facility}/>
					}
        </Content>
				<Sidebar>
					{ true && <IconButton block size='sm' icon={<Icon icon="building" />} onClick={() => Alert.info('You want to build a base, but you cant!')}>New Facility</IconButton>}
           { true && <IconButton block size='sm' icon={<Icon icon="fighter-jet" />} onClick={() => Alert.info('You want to build a aircraft, but you cant!')}>New Aircraft</IconButton>}
           { true && <IconButton block size='sm' icon={<Icon icon="space-shuttle" />} onClick={() => Alert.info('You want to build a spacecraft, but you cant!')}>New Spacecraft</IconButton>}
					{ true && <IconButton block size='sm' icon={<Icon icon="crosshairs" />} onClick={() => Alert.info('You want to build a military, but you cant!')}>New Military Unit</IconButton>}
           <br />
           <PanelGroup accordion >
						<Panel 
							bordered bodyFill header="Facilities" 
						>
							<List height={400} hover autoScroll>
								{this.props.facilities.map((facility, index) => (
									<List.Item key={index} index={index} onClick={() => this.setState({ facility, unit: undefined })}>
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
									<List.Item key={index} index={index} onClick={() => this.setState({ unit, facility: undefined })}>
										{unit.name}
									</List.Item>
								))}
							</List>
						</Panel>
           </PanelGroup>
        </Sidebar>
        </Container>
		);
	}	
}

const mapStateToProps = state => ({
	login: state.auth.login,
	team: state.auth.team,
	teams: state.entities.teams.list,
	account: getOpsAccount(state),
	units: getMilitary(state),
	facilities: getFacilites(state)
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(AssetTab);