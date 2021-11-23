import React, { Component } from 'react';
import { Alert, Button, Container, SelectPicker, Header, Content, InputNumber, Icon, Table, Sidebar, ButtonToolbar, IconButton } from 'rsuite';
import { connect } from 'react-redux'; // Redux store provider
import UpgradeModal from '../../../components/upgradeModal';
import { gameServer } from '../../../config';
import axios from 'axios';
import { socket } from '../../../api';
import AssetTab from '../ops/AssetTab';
// import upgrade from '../../../../../server/models/upgrade';

const { HeaderCell, Cell, Column } = Table;

const UnitControl = (props) => {

	return (
		<Container>
			<AssetTab history={props.history} handleTransfer={props.handleTransfer} control={true} selected={props.selected}/>
		</Container>
	);
	
}

const mapStateToProps = state => ({
	login: state.auth.login,
	team: state.auth.team,
	sites: state.entities.sites.list,
	military: state.entities.military.list,
	aircraft: state.entities.aircrafts.list,
	blueprints: state.entities.blueprints,
	lastFetch: state.entities.military.lastFetch
	// baseSites: getBases(state)
	});
	
	const mapDispatchToProps = dispatch => ({});
export default connect(mapStateToProps, mapDispatchToProps)(UnitControl);


			// <UpgradeModal show={this.state.showUpgrade}
			// 	showUpgrade={this.showUpgrade} 
			// 	closeUpgrade={this.closeUpgrade}
			// 	unit={this.state.selected}
			// />


					// <Table
					// 	isTree
					// 	defaultExpandAllRows
					// 	rowKey="id"
					// 	autoHeight
					// 	data={this.state.data}
					// 	renderTreeToggle={(icon, rowData) => {
					// 		// console.log(rowData);
					// 		if (rowData.children && rowData.children.length === 0) {
					// 		return <Icon icon="spinner" spin />;
					// 		}
					// 		return icon;
					// 	}}
					// 	>

					// 	<Column flexGrow={1} >
					// 		<HeaderCell>Name</HeaderCell>
					// 		<Cell dataKey="name" />
					// 	</Column>

					// 	<Column flexGrow={1} >
					// 		<HeaderCell>Type</HeaderCell>
					// 		<Cell dataKey="type" />
					// 	</Column>

					// 	<Column flexGrow={1} >
					// 		<HeaderCell>Effects</HeaderCell>
					// 		<Cell dataKey="effect" />
					// 	</Column>

					// 	<Column>
					// 		<HeaderCell>Delete</HeaderCell>
					// 			<Cell style={{padding: '8px'}}>
					// 				{rowData => {
					// 					if (typeof rowData.id === 'string') return (<Button color='red' onClick={() => this.handleDelete(rowData.id)}>Delete</Button>)
					// 					else return '';
					// 				}}
					// 			</Cell>
					// 	</Column>

          //   </Table>
