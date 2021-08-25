import React, { useEffect } from 'react';
import { Container, Content, Icon, Table, Button, Alert, Panel } from 'rsuite';
import socket from '../../../../socket';

const { HeaderCell, Cell, Column } = Table;

const UpgradeTable = (props) => {
	const [data, setData] = React.useState();

	useEffect(() => {
		loadTable();
	}, [props]);

	const loadTable = () => {
		let obj = {};               // Object to add to the data array
		let someData = [];                  // Data to populate the table with
		let id_count = 0;        // A unique count to assign to the fields
		for (let upgrade of props.unit.upgrades) { 
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
				someData.push(obj);
		}  
		setData(someData);
}

const handleRemove = async (upgrade) => {
	try {
		socket.emit( 'upgradeSocket', 'remove', { upgrade, unit: props.selected, model: props.unit.model });
	}
	catch (err) {
		Alert.error(`Error: ${err.body} ${err.message}`, 5000)
	}
}

return (
	<Container>
		<Content>
			<hr />
			<p>Upgrades</p>
			{data && data.length > 0 && <Table
				isTree
				defaultExpandAllRows
				rowKey="id"
				autoHeight
				data={data}
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
								if (typeof rowData.id === 'string') return (<Button color='red' size='xs' onClick={() => handleRemove(rowData.id)}>Remove</Button>)
								else return '';
							}}
						</Cell>
				</Column>
			</Table>
			}
			{!data && <Panel>
				No Upgrades Equipped
			</Panel>}
		<br></br>
		</Content>
	</Container>
);
	
}

export default UpgradeTable;