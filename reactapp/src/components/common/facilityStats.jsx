import React, { Component } from "react";
import axios from 'axios';
import { connect } from 'react-redux'; // Redux store provider
import { FlexboxGrid, Panel, Container, Table, Col, Row, SelectPicker} from 'rsuite';
import { getAircrafts } from "../../store/entities/aircrafts";
import { getFacilites } from "../../store/entities/facilities";
import { gameServer } from "../../config";

const { HeaderCell, Cell, Column } = Table;

class FacilityStats extends Component{
	state = {
		aircraft: [],
		military: [],
		selected: null,
		labs: []
	}

	componentDidMount() {
		const aircraft = this.props.aircrafts.filter(el => el.origin.name === this.props.facility.name );
		const military = this.props.military.filter(el => el.origin.name === this.props.facility.name );
		this.initLabs(this.props.facility);
		this.setState({ aircraft, military });
	};

	componentDidUpdate(prevProps, prevState) {
		if (prevProps.facility !== this.props.facility) {
			const aircraft = this.props.aircrafts.filter(el => el.origin.name === this.props.facility.name );
			const military = this.props.military.filter(el => el.origin.name === this.props.facility.name );
			this.initLabs(this.props.facility);
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

	}

	render () {
		const {name, site, capability} = this.props.facility;
		return (
			<Container>
			<Panel>
			<FlexboxGrid>
				<FlexboxGrid.Item colspan={12}>
					<p>
						<b>Name:</b> {name}
					</p>
					<p>
						<b>Location:</b> {site.name}
					</p>
				</FlexboxGrid.Item>
			</FlexboxGrid>
			</Panel>
			<Panel header={`Production			| Capacity: ${capability.manufacturing.capacity}`}>
				<Table height={100} data={this.state.labs}>
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
					<Panel header={`Docked Aircraft			| Capacity: ${this.state.aircraft.length} / ${capability.airMission.capacity}`}>
					<Table data={this.state.aircraft}>
							<Column width={300} fixed>
								<HeaderCell>Name</HeaderCell>
								<Cell dataKey="name" />
							</Column>
						</Table>
					</Panel>
				</Col>
				<Col md={8} sm={14}>
					<Panel header={`Based Military			| Capacity: ${this.state.military.length} / ${capability.ground.capacity}`}>
					<Table data={this.state.military}>
							<Column width={300} fixed>
								<HeaderCell>Name</HeaderCell>
								<Cell dataKey="name" />
							</Column>
						</Table>
					</Panel>
				</Col >
				<Col>
					<Panel header={`Research			| Capacity: ${capability.research.capacity}`}>
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