import React, { useEffect } from 'react';
import { Alert, Panel, Container, SelectPicker,  } from 'rsuite';
import { connect } from 'react-redux'; // Redux store provider
import { showDeploy } from '../../../store/entities/infoPanels';
import MilitaryTable from '../ops/asset/MilitaryTable';

const MilitaryControl = (props) => {
	const [units, setUnit] = React.useState(props.military);
	const [filter, setFilter] = React.useState(undefined);

	useEffect(() => {
		if (props.military) {
			handleThing(filter)
		}
	}, [props.military]);


	const handleThing = (value) => {
		const site = props.sites.find(el => el._id === value);
		const team = props.teams.find(el => el._id === value);
		if (site) {
			setUnit(props.military.filter(el => el.site._id === value))
		}
		else if (team) {
			setUnit(props.military.filter(el => el.team._id === value))
		}
		else {
			// Alert.error('Whoops, scott fucked up!', 6000);
			setUnit(props.military)
		}
		setFilter(value)
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
			<MilitaryTable control={true} handleTransfer={props.handleTransfer} military={units}/>
			</Panel>
			{/* <InvasionModal show={this.state.showInvade}
				military={this.props.military}
				accounts={this.props.accounts}
				teams={this.props.teams}
				sites={this.props.sites}
				showInvade={this.showInvade} 
				closeInvade={this.closeInvade}
			/> */}
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

export default connect(mapStateToProps, mapDispatchToProps)(MilitaryControl);

					// eslint-disable-next-line no-lone-blocks
					{/* <h5>Military Simulation</h5>
					<hr />
				</Header>
				<Content>
					<h4>Attacker Army</h4>
					<CheckPicker 
						data={this.props.military} 
						onChange={this.handleAttacker} 
						valueKey="_id"
						labelKey="name"
						value={this.state.picked}								
						>
					</CheckPicker>
					<p>Attack Total: { this.state.atk.attack } </p>
					<p>Defense Total: { this.state.atk.defence } </p>
					<br></br>
					<h4>Defender Army</h4>
					<CheckPicker 
						data={this.props.military} 
						onChange={this.handleDefender} 
						valueKey="_id"
						labelKey="name"
						value={this.state.picked}								
					>
					</CheckPicker>
					<p>Attack Total: { this.state.def.attack } </p>
					<p>Defense Total: { this.state.def.defence } </p>
					<div style={{ display: "flex "}}>
						<Button color="red" onClick={this.handleSubmit} style={{ marginLeft: "auto" }} >Submit</Button>		 				
					</div>
					<hr />
					<h4>Result: </h4>
					<p>Attacker Hits: { this.state.attackerResult } </p>
					<p>Defender Hits: { this.state.defenderResult } </p>
				</Content>
			</Container> */}


