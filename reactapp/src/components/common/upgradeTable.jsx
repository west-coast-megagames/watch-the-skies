import React, { Component } from 'react';
import { Container, Content, Icon, Table, Button, Alert } from 'rsuite';
import axios from 'axios';
import { gameServer } from '../../config';


const { HeaderCell, Cell, Column } = Table;

class UpgradeTable extends Component {
	state = { 
		selected: this.props.unit,
		data: []
	}

	componentDidMount() {
			this.loadTable();
	};

	componentDidUpdate(prevProps, prevState) {
		if (prevProps.unit !== this.props.unit) {
			this.loadTable();
		}
	}

	loadTable () {
		let obj = {};               // Object to add to the data array
		let data = [];                  // Data to populate the table with
		let id_count = 0;           // A unique count to assign to the fields
		for (let upgrade of this.props.unit.upgrades) { 
			id_count++;   
				obj = {
						id: upgrade._id,
						name: upgrade.name,
						effect: '',
						children: []
				}
				for (let effect of upgrade.effects) {
					let thisType = 'Unknown'
					switch (effect.type) {
						case 'attack': 
							thisType = 'Attack'
							break;
						case 'defense': 
							thisType = 'Defense'
							break;
						case 'terror': 
							thisType = 'Terror'
							break;
						case 'pr': 
							thisType = 'PR'
							break;
						default:
							thisType = 'Unknown'
							break;
					}
					let ob2 = {
						id: id_count,
						effect: effect.effect,
						type: thisType
					}
					obj.children.push(ob2);
				}
				data.push(obj);
		}    
		this.setState({ data })
}

handleDelete = async (upgrade) => {
	try {
		await axios.put(`${gameServer}game/upgrades/remove`, {upgrade, unit: this.state.selected});
	}
	catch (err) {
		Alert.error(`Error: ${err.body} ${err.message}`, 5000)
	}
}

	render() { 
		return (
			<Container>
				<Content>
					<hr />
					<p>Upgrades</p>
					{this.state.data.length > 0 && <Table
						isTree
						defaultExpandAllRows
						rowKey="id"
						autoHeight
						data={this.state.data}
						renderTreeToggle={(icon, rowData) => {
							// console.log(rowData);
							if (rowData.children && rowData.children.length === 0) {
							return <Icon icon="spinner" spin />;
							}
							return icon;
						}}
					>
						<Column flexGrow={1} >
							<HeaderCell>Name</HeaderCell>
							<Cell dataKey="name" />
						</Column>

						<Column flexGrow={1} >
							<HeaderCell>Type</HeaderCell>
							<Cell dataKey="type" />
						</Column>

						<Column flexGrow={1} >
							<HeaderCell>Effects</HeaderCell>
							<Cell dataKey="effect" />
						</Column>
						<Column>
							<HeaderCell>Delete</HeaderCell>
								<Cell style={{padding: '8px'}}>
									{rowData => {
										if (typeof rowData.id === 'string') return (<Button color='red' onClick={() => this.handleDelete(rowData.id)}>Remove</Button>)
										else return '';
									}}
								</Cell>
						</Column>
					</Table>
					}
				<br></br>
				</Content>
			</Container>
		);
	}
}

export default UpgradeTable;