import React, { Component } from 'react';
import { Alert, Button, Container, SelectPicker, Header, Content, InputNumber, Icon, Table, Sidebar, ButtonToolbar, IconButton } from 'rsuite';
import { connect } from 'react-redux'; // Redux store provider
import UpgradeModal from '../../../components/upgradeModal';
import { gameServer } from '../../../config';
import axios from 'axios';
// import upgrade from '../../../../../server/models/upgrade';

const { HeaderCell, Cell, Column } = Table;

class UnitControl extends Component {
	state = { 
		units: [],
		selected: null,
		hidden: true,
		showUpgrade: false
	 }

	 showUpgrade = () => { this.setState({showUpgrade: true}) };
	 closeUpgrade = () => { this.setState({showUpgrade: false}) };

	componentDidMount() {
		this.setState({ units: this.props.military})
	}

	handleSelect = async (unit) => { 
		if (!unit) {
			this.setState({ selected: null, hidden: true });
			return;
		}
		let {data} = await axios.get(`${gameServer}api/military/${unit}`);
		console.log(data);
		this.setState({ selected: data, hidden: false });
	}

	handleSubmit = async () => {
		try {
			let {data} = await axios.patch(`${gameServer}api/military/`, {editedUnit: this.state.selected})
			this.setState({ selected: null })
		console.log(data);			
		}
		catch (err) {
			Alert.error(`Error: ${err.body} ${err.message}`, 5000)
		}
	}

	handleEdit = (value, target) => {
		value = parseInt(value);
		if (isNaN(value)) value = 0;
		let selected = this.state.selected;
		switch(target){
			case 'health':
				selected.stats.health = value;
				break;
			case 'attack':
				selected.stats.attack = value;
				break;
			case 'defense':
				selected.stats.defense = value;
				break;
			default:
				console.log("uh oh");
		}
		this.setState({ selected });
	}

	render() { 
		return (
			<Container>
			<Container>
			<Header>
				<SelectPicker 
						data={this.props.military} 
						onChange={this.handleSelect} 
						style={{ width: 250 }} 
						valueKey="_id"
						labelKey="name"
						value={this.state.picked}
					/>
					<hr />
			</Header>
			<Content>


				{this.state.selected && <React.Fragment>
					<InputNumber prefix="HP" style={{ width: 40 }} value={ this.state.selected.stats.health } onChange={(value) => this.handleEdit(value, 'health')}> </InputNumber>
					<InputNumber prefix="ATK" style={{ width: 40 }} value={ this.state.selected.stats.attack } onChange={(value) => this.handleEdit(value, 'attack')}> </InputNumber>
					<InputNumber prefix="DEF" style={{ width: 40 }} value={ this.state.selected.stats.defense } onChange={(value) => this.handleEdit(value, 'defense')}> </InputNumber>
					<hr />
					<p>Upgrades</p>
					<Table 
							rowKey='_id'
							autoHeight
							data={ this.state.selected.upgrades }
					>
							<Column flexGrow={1}>
									<HeaderCell>Name</HeaderCell>
									<Cell dataKey='name' />
							</Column>
							<Column flexGrow={1}>
									<HeaderCell>Id</HeaderCell>
									<Cell dataKey='_id' />
							</Column>
					</Table>
					<div style={{ display: "flex "}}>
						<IconButton color="green" onClick={this.showUpgrade}  style={{ marginLeft: "auto" }} icon={<Icon icon="plus"/>}></IconButton>
					</div>
				</React.Fragment>}
			</Content>
			</Container>
			<Sidebar>
					<ButtonToolbar>
						<Button color="red" onClick={this.handleSubmit}>Submit</Button>								
					</ButtonToolbar>
			</Sidebar>
			<UpgradeModal show={this.state.showUpgrade}
				showUpgrade={this.showUpgrade} 
				closeUpgrade={this.closeUpgrade}
				unit={this.state.selected}
			/>


	</Container>

		);
	}
}

const mapStateToProps = state => ({
	login: state.auth.login,
	team: state.auth.team,
	sites: state.entities.sites.list,
	military: state.entities.military.list,
	aircraft: state.entities.aircrafts.list,
	blueprints: state.entities.blueprints,
	// citySites: getCities(state),
	// baseSites: getBases(state)
	});
	
	const mapDispatchToProps = dispatch => ({});
export default connect(mapStateToProps, mapDispatchToProps)(UnitControl);