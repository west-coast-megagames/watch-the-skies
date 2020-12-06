import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Alert, Table, Drawer, List, Popover, Whisper, Icon, IconButton, Panel } from 'rsuite';
import ListItem from 'rsuite/lib/List/ListItem';
import { gameServer } from '../../config';
import { getUpgrades } from '../../store/entities/upgrades';
import axios from 'axios';

const { HeaderCell, Cell, Column } = Table;

class UpgradeDrawer extends Component {
	state = { 
		selected: null,
		eligibleUps: []
	 }

	 componentDidMount() { //el.status.storage === true &&
		const eligibleUps = this.props.upgrades.filter(el =>  el.status.damaged === false && el.status.destroyed === false);
		this.setState({ eligibleUps });
		console.log(this.state.eligibleUps)
	};

	whisperSelector = (rowData) => {
		let speak;
		let img;
		switch (rowData.type) {
			case 'attack':
				speak = (
					<Popover title="Attack Rating Information">
						<p>Attack is the power rating for the unit when it attacks.</p>
					</Popover>
				);
				break;
			case 'defense':
				speak = (
					<Popover title="Defense Rating Information">
						<p>
							Defense is the power rating for the unit when it is defending from an
							attack.
						</p>
					</Popover>
				);
				img = 'shield';
				break;
			default:
				speak = (
					<Popover title="Unkown">
						<p>
							Who knows what this does. Better not touch it. Or maybe.... No. Best not. 
						</p>
					</Popover>
				);
		}
		return(
			<Whisper placement="top" speaker={speak} trigger="click">
			<IconButton size="xs" icon={<Icon icon="info-circle" />} />
		</Whisper>
		)
		}

	handleSubmit = async (blueprint) => {
		// 1) make a new upgrade from blueprint
		try{
			await axios.put(`${gameServer}game/upgrades/add`, {upgrade: this.state.selected._id, unit: this.props.unit._id })
			
			this.props.closeUpgrade()
		}
		catch (err) {
			Alert.error(`Error: ${err.body} ${err.message}`, 5000)
		}
	}

	render() { 
		return ( 
			<Drawer
				size='sm'  
				placement='right' 
				show={this.props.show} 
				onHide={() => this.props.closeUpgrade()}>
					<Drawer.Header>
						<Drawer.Title>Add an Upgrade from storage:</Drawer.Title>
					</Drawer.Header>
					<Drawer.Body>
						<List height={400} hover autoScroll bordered>
							{this.state.eligibleUps.map((upgrade, index) => (
								<List.Item key={index} index={index} onClick={() => this.setState({ selected: upgrade })}>
									{upgrade.name}
								</List.Item>
							))}
						</List>
						{this.state.selected && <Panel header="Panel title">
						 <Table height={200} data={this.state.selected.effects}>
							<Column verticalAlign='middle' align="left" fixed>
								<HeaderCell>Type</HeaderCell>
								<Cell>
									{rowData => {
										switch (rowData.type) {
											case 'attack': 
												return (<b>Attack</b>)
											case 'defense': 
												return (<b>Defense</b>)
											case 'terror': 
												return (<b>Terror</b>)
											case 'pr': 
												return (<b>Public Relations (PR)</b>)
											default:
												return(<b>Unknown</b>)
										}
									}}
								</Cell>
							</Column>
							<Column verticalAlign='middle' align="center" flexGrow={1}>
								<HeaderCell>Effect</HeaderCell>
								<Cell dataKey="effect" />
							</Column>
							<Column verticalAlign='middle' align="center" flexGrow={1}>
								<HeaderCell>Description</HeaderCell>
								<Cell>
								{rowData => {
                  return this.whisperSelector(rowData)
                }}
								</Cell>
							</Column>
						</Table>
						<Button color="green" style={{ marginLeft: "auto" }} onClick={this.handleSubmit}>Add</Button>		
					 </Panel>}
					</Drawer.Body>
			</Drawer>
		 );
	}
}
 
const mapStateToProps = state => ({
	upgrades: getUpgrades(state),
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(UpgradeDrawer);