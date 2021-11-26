import React, { useEffect } from 'react';
import { Alert, Panel, Container, SelectPicker,  } from 'rsuite';
import { connect } from 'react-redux'; // Redux store provider
import { showDeploy } from '../../../store/entities/infoPanels';
import MilitaryTable from '../ops/asset/MilitaryTable';
import AircraftTable from '../ops/asset/AircraftTable';

const AircraftControl = (props) => {
	const [units, setUnit] = React.useState(props.aircraft);

	useEffect(() => {
		if (props.aircraft) {
			setUnit(props.aircraft)
		}
	}, [props.aircraft]);


	const handleThing = (value) => {
		const site = props.sites.find(el => el._id === value);
		const team = props.teams.find(el => el._id === value);
		if (site) {
			setUnit(props.aircraft.filter(el => el.site._id === value))
		}
		else if (team) {
			setUnit(props.aircraft.filter(el => el.team._id === value))
		}
		else {
			Alert.error('Whoops, scott fucked up!', 6000);
			setUnit(props.aircraft)
		}
	}

	return (
		<Container>
			<Panel bodyFill bordered>
			<SelectPicker
   		  data={props.sites}
				valueKey='_id'
				labelKey='name'
				appearance="default"
				placeholder="Filter by Site"
				style={{ width: 224 }}
				onChange={(value) => handleThing(value)}
			/>
			<SelectPicker
   		  data={props.teams}
				valueKey='_id'
				labelKey='name'
				appearance="default"
				placeholder="Filter by Team"
				style={{ width: 224 }}
				onChange={(value) => handleThing(value)}
			/>
			<AircraftTable control={true} handleTransfer={props.handleTransfer} aircrafts={units}/>
			</Panel>
		</Container>
	);
	
}

const mapStateToProps = state => ({
	login: state.auth.login,
	team: state.auth.team,
	sites: state.entities.sites.list,
	teams: state.entities.teams.list,
	military: state.entities.military.list,
	aircraft: state.entities.aircrafts.list,
	// citySites: getCities(state),
	// baseSites: getBases(state)
	});
	
	const mapDispatchToProps = dispatch => ({
		showDeploy: () => dispatch(showDeploy())
	});

export default connect(mapStateToProps, mapDispatchToProps)(AircraftControl);