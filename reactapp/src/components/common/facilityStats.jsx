import React, { Component } from "react";
import { connect } from 'react-redux'; // Redux store provider
import { FlexboxGrid, Panel, Container, Table} from 'rsuite';
import { getAircrafts } from "../../store/entities/aircrafts";
import { getFacilites } from "../../store/entities/facilities";

const { HeaderCell, Cell, Column } = Table;

class FacilityStats extends Component{
	state = {
		aircraft: [],
		military: [],
		labs: []
	}

	componentDidMount() {
		const aircraft = this.props.aircrafts.filter(el => el.origin.name === this.props.facility.name )
		const military = this.props.military.filter(el => el.origin.name === this.props.facility.name )
		this.initLabs();
		this.setState({ aircraft, military })
	};

	componentDidUpdate(prevProps, prevState) {
		if (prevProps.facility !== this.props.facility) {
			const aircraft = this.props.aircrafts.filter(el => el.origin.name === this.props.facility.name )
			const military = this.props.military.filter(el => el.origin.name === this.props.facility.name )
			this.setState({ aircraft, military })
		}
	}

	// Function run at start.  Initializes labs state by this team
	initLabs = () => {
		let teamLabs = this.props.facilities.filter(el => el.team !== null );
		if (teamLabs.length !== 0) {
			let labs = [];				// Array of research Objects
			let obj = {};               // Object to add to the research array
			
			teamLabs.forEach(facility => {
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
			});
			this.setState({labs});
		}
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
			<Panel header={`Docked Aircraft			| Capacity: ${capability.airMission.capacity}`} bordered>
				<Table height={200} data={this.state.aircraft}>
					<Column width={300} fixed>
						<HeaderCell>Name</HeaderCell>
						<Cell dataKey="name" />
					</Column>
				</Table>
			</Panel>
			<Panel header={`Based Military			| Capacity: ${capability.ground.capacity}`} bordered>
				<Table height={200} data={this.state.military}>
					<Column width={300} fixed>
						<HeaderCell>Name</HeaderCell>
						<Cell dataKey="name" />
					</Column>
				</Table>
			</Panel>
		</Container>	
		)};
}

const mapStateToProps = state => ({
	military: state.entities.military.list,
	aircrafts: getAircrafts(state),
	facilities: getFacilites(state)
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(FacilityStats);