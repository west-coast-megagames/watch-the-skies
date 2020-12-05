import React, { Component } from 'react';
import { connect } from 'react-redux'; // Redux store provider
import { Table, Icon, ButtonGroup, IconButton } from 'rsuite';
import { showMilitary } from '../../../store/entities/infoPanels';
const { HeaderCell, Cell, Column } = Table;

class GlobalOps extends Component {
	state = {
		data: []
	}

	componentDidMount() {
		this.loadTable();
	}

	render() { 
		return (
			<React.Fragment>
				<h5>Global Military Operations</h5>
				<Table
					isTree
					defaultExpandAllRows
					rowKey="_id"
					autoHeight
					data={ this.state.data }
					onExpandChange={(isOpen, rowData) => {
						// console.log(isOpen, rowData);
						return
					}}
					renderTreeToggle={(icon, rowData) => {
						if (rowData.children && rowData.children.length === 0) {
						return <Icon icon="spinner" spin />;
						}
						return icon;
					}}
					>
					<Column width={400}>
						<HeaderCell>Name</HeaderCell>
						<Cell dataKey="name" />
					</Column>

					<Column flexGrow={1}>
						<HeaderCell>Status</HeaderCell>
						<Cell dataKey="type" />
					</Column>

					<Column flexGrow={4}>
						<HeaderCell>Information</HeaderCell>
						<Cell dataKey="globeinfo" />
					</Column>

					<Column flexGrow={2}>
						<HeaderCell>Unit Location</HeaderCell>
						<Cell dataKey="country.name" />
					</Column>

					<Column width={150} fixed="right">
						<HeaderCell>Actions</HeaderCell>
						<Cell style={{padding: '8px'}}>
						{ rowData => {
							if (rowData.type !== 'zone') {
								return (
									<ButtonGroup size='sm'>
										<IconButton icon={<Icon icon="info-circle" />} onClick={() => this.props.showMilitary(this.props.military.find(el => el._id === rowData._id))} color="blue"/>
									</ButtonGroup>
								)
							} 
						}}
						</Cell>
					</Column>
				</Table>
				<hr />
				<h5>Air Operations</h5>
				<p>Table of all air contacts...</p>
				<hr />
				<h5>Space Operations</h5>
				<p>Table of all space operations...</p>
			</React.Fragment>
		);
	}

	loadTable() {
		let data = []
		let military = this.props.military.filter(el => el.__t === 'Corps');
		let zones = this.props.zones.filter(el => el.name !== 'Space')
		zones = zones.map((item) => Object.assign({}, item, {selected:false}));
		military = military.map((item) => Object.assign({}, item, {selected:false}));

		for (let newZone of zones) {
			let zone = {...newZone};
			zone.children = []
			zone.type = 'zone'
			for (let unit of military) {
				let checkZone = zone;
				if (unit.zone.name === checkZone.name) {
					unit.type = 'unit'
					unit.info = `Health ${unit.stats.health}/${unit.stats.healthMax} | Attack: ${unit.stats.attack} | Defense: ${unit.stats.defense}`;
					zone.children.push(unit);
				}
			}
			data.push(zone);
		}
		this.setState({ data })
	};
}

const mapStateToProps = state => ({
	login: state.auth.login,
	team: state.auth.team,
	zones: state.entities.zones.list,
	military: state.entities.military.list
});

const mapDispatchToProps = dispatch => ({
  showMilitary: unit => dispatch(showMilitary(unit))
});

export default connect(mapStateToProps, mapDispatchToProps)(GlobalOps);