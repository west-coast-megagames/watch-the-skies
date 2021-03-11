import React, { Component } from "react";
import axios from 'axios';
import { connect } from 'react-redux'; // Redux store provider
import { Tag, TagGroup, FlexboxGrid, Panel, Container, Table, Col, Row, SelectPicker, Icon, Alert, IconButton} from 'rsuite';
import { getAircrafts } from "../../store/entities/aircrafts";
import { getFacilites } from "../../store/entities/facilities";
import { gameServer } from "../../config";

const { HeaderCell, Cell, Column } = Table;

class FacilityStats extends Component{
	state = {
		aircraft: [],
		military: [],
		selected: null,
		factories: [],
		labs: []
	}

	componentDidMount() {
		const aircraft = this.props.aircrafts.filter(el => el.origin.name === this.props.facility.name );
		const military = this.props.military.filter(el => el.origin.name === this.props.facility.name );
		this.initLabs(this.props.facility);
		this.initProduction(this.props.facility);
		this.setState({ aircraft, military });
	};

	componentDidUpdate(prevProps, prevState) {
		if (prevProps.facility !== this.props.facility) {
			const aircraft = this.props.aircrafts.filter(el => el.origin.name === this.props.facility.name );
			const military = this.props.military.filter(el => el.origin.name === this.props.facility.name );
			this.initLabs(this.props.facility);
			this.initProduction(this.props.facility);
			this.setState({ aircraft, military });
		}
	}

	handleSelect = async (blueprint) => { 
		if (!blueprint) {
			this.setState({ selected: null });
			return;
		}
		let {data} = await axios.get(`${gameServer}api/blueprints/${blueprint}`);
		this.setState({ selected: data });
	}

	// Function run at start.  Initializes labs state by this team
	initLabs = (facility) => {

		let teamLabs = this.props.facilities.filter(el => el.team !== null );
		if (teamLabs.length !== 0) {
			let labs = [];				// Array of research Objects
			let obj = {};               // Object to add to the research array
			

			for (let i = 0; i < facility.capability.research.capacity; i++) {
				let { funding, projects, status } = facility.capability.research;
				//console.log(facility);
				let funds = typeof funding[i] === 'number' ? funding[i] : 0;
				let research = projects[i] === null ? undefined : projects[i];
				obj = {
					_id: 			facility._id,
					index:			i,
					funding: 		funds,
					name:			`${facility.name} - Lab 0${i+1}`,
					research:		research,					
					status:			{ 
										damage: status.damage[i],
										pending: status.pending[i]
									},
					team:			{
										_id:			facility.team._id,
										shortName:		facility.team.shortName
									}
				}
				// Temporary fix for backend not clearing out the labs' research array upon completion
				// TODO: Jay fix the backend so that the research array for a lab is nulled out when a research completes to 100%
				//console.log(obj.name);
				// if (getLabPct(obj._id, this.props.facilities, this.props.research, this.props.techCost) >= 100) {	obj.research = []; } 
				labs.push(obj);
			}

			this.setState({labs});
		}
	}

	initProduction = (facility) => {
		let thisFacility = this.props.facilities.filter(el => el.team !== null );
		if (thisFacility.length !== 0) {
			let factories = [];				// Array of research Objects
			let obj = {};               // Object to add to the research array
			

			for (let i = 0; i < facility.capability.manufacturing.capacity; i++) {
				let { manufacturing } = facility.capability;
				//console.log(facility);
				obj = {
					_id: 			facility._id,
					index:			i,
					name:			`${facility.name} - Factory 0${i+1}`,			
					status:			{ 
										damage: manufacturing.damage,
										active: manufacturing.active
									},
					team:			{
										_id:			facility.team._id,
										shortName:		facility.team.shortName
									}
				}
				// Temporary fix for backend not clearing out the factories' research array upon completion
				// TODO: Jay fix the backend so that the research array for a lab is nulled out when a research completes to 100%
				//console.log(obj.name);
				// if (getLabPct(obj._id, this.props.facilities, this.props.research, this.props.techCost) >= 100) {	obj.research = []; } 
				factories.push(obj);
			}

			this.setState({factories});
		}
	}

	render () {
		const {name, site, capability, status} = this.props.facility;
		return (
			<Container>
			<Panel>
			<FlexboxGrid>
				<FlexboxGrid.Item colspan={4}>
						<img
							src={'https://cdn.discordapp.com/attachments/582043597281427466/783189080258248735/AUS_tank_v5.1.png'} width="160" height="160" 
						/>									
				</FlexboxGrid.Item>
				<FlexboxGrid.Item colspan={16}>
					<p>
						<b>Name:</b> {name}
					</p>
					<p>
						<b>Location:</b> {site.name}
					</p>
					<TagGroup>
						{!status.damaged && !status.deployed && <Tag color="green">Mission Ready</Tag>}
						{status.secret && <Tag color="blue">Hidden</Tag>}
						{status.repair && <Tag color="yellow">Repairing</Tag>}
						{status.defenses && <Tag color="green">Defenses Active</Tag>}
					</TagGroup>
				</FlexboxGrid.Item>
				<FlexboxGrid.Item colspan={4}>
					<IconButton color='green' block size='sm' icon={<Icon icon="building" />} onClick={() => Alert.info('You want to build a base, but you cant!')}>Build New Facility</IconButton>
					<IconButton color='blue' block size='sm' icon={<Icon icon="plus" />} onClick={() => Alert.info('You want to upgrade this facility, but you cant!')}>Upgrade Facility</IconButton>
				</FlexboxGrid.Item>
			</FlexboxGrid>
			</Panel>
			<Panel header={`Production			| Capacity: ${capability.manufacturing.capacity}`}>
				<Table height={100} data={this.state.factories}>
						<Column verticalAlign='middle' flexGrow={2} align="left" fixed>
							<HeaderCell>Name</HeaderCell>
							<Cell dataKey="name" />
						</Column>
						<Column verticalAlign='middle' flexGrow={2} align="left" fixed>
						<HeaderCell>Production Focus</HeaderCell>
							<Cell style={{ padding: 0 }} dataKey="name">
								<SelectPicker
									valueKey='_id'
									labelKey='name'
									onChange={this.handleSelect} 
									data={this.props.blueprints.filter(el => el.buildModel === 'upgrade')} 
								/>
								</Cell>
						</Column>
						<Column verticalAlign='middle' flexGrow={2}>
						<HeaderCell>buildCount</HeaderCell>
							<Cell dataKey="buildCount" />
					</Column>
					</Table>
			</Panel>	
			<hr/>
			<Row>
				<Col md={8} sm={14}>
					<Panel bordered header={`Docked Aircraft			| Capacity: ${this.state.aircraft.length} / ${capability.airMission.capacity}`}>
					<Table data={this.state.aircraft}>
							<Column width={300} fixed>
								<HeaderCell>Name</HeaderCell>
								<Cell dataKey="name" />
							</Column>
						</Table>
					</Panel>
				</Col>
				<Col md={8} sm={14}>
					<Panel bordered header={`Based Military			| Capacity: ${this.state.military.length} / ${capability.ground.capacity}`}>
					<Table data={this.state.military}>
							<Column width={300} fixed>
								<HeaderCell>Name</HeaderCell>
								<Cell dataKey="name" />
							</Column>
						</Table>
					</Panel>
				</Col >
				<Col>
					<Panel bordered header={`Research			| Capacity: ${capability.research.capacity}`}>
							<Table data={this.state.labs}>
									<Column width={300} fixed>
										<HeaderCell>Name</HeaderCell>
										<Cell dataKey="name" />
									</Column>
								</Table>
						</Panel>				
				</Col>
			</Row>
		</Container>	
		)};
}

const mapStateToProps = state => ({
	military: state.entities.military.list,
	aircrafts: getAircrafts(state),
	blueprints: state.entities.blueprints.list,
	facilities: getFacilites(state)
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(FacilityStats);