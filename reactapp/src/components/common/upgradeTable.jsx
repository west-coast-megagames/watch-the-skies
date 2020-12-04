import React, { Component } from 'react';
import { Alert, Button, Container, SelectPicker, Header, Content, InputNumber, Icon, Table, Sidebar, ButtonToolbar, IconButton } from 'rsuite';

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
					let ob2 = {
						id: id_count,
						effect: effect.effect,
						type: effect.type
					}
					obj.children.push(ob2);
				}
				data.push(obj);
		}    
		this.setState({ data })
}

	render() { 
		return (
			<Container>
			<Container>
			<Content>
				<React.Fragment>
					<hr />
					<p>Upgrades</p>
					<Table
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
            </Table>
				</React.Fragment>
			</Content>
			</Container>
	</Container>

		);
	}
}

export default UpgradeTable;