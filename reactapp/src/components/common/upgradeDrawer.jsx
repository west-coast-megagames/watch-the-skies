import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Alert, Table, Drawer, List, Popover, Whisper, Icon, IconButton, Panel } from 'rsuite';
import { gameServer } from '../../config';
import { getStored } from '../../store/entities/upgrades';
import axios from 'axios';
import { socket } from '../../api';

const { HeaderCell, Cell, Column } = Table;

class UpgradeDrawer extends Component {
	state = { 
		selected: null,
		eligibleUps: []
	 }

	 componentDidMount() { //
		this.setState({ eligibleUps: this.props.upgrades });
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
			socket.emit( 'upgradeSocket', 'add', {upgrade: this.state.selected._id, unit: this.props.unit._id, model: this.props.unit.model })
			
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
						{!this.state.selected &&  <Panel bodyFill >
							<List hover autoScroll bordered style={{scrollbarWidth: 'none', textAlign: 'center', cursor: 'pointer' }}>
								{this.state.eligibleUps.map((upgrade, index) => (
									<List.Item key={upgrade._id} index={index} onClick={() => this.setState({ selected: upgrade })}>
										{upgrade.name}
									</List.Item>
								))}
							</List>							
						</Panel>}

						{this.state.selected && <React.Fragment>
						 <h4>{this.state.selected.name}</h4>
						 <Table data={this.state.selected.effects} header={'Upgrade Stats'}>
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
							<Button color="red"  onClick={()=> this.setState({selected: null})}>Reselect</Button>		
							<Button color="green"  onClick={this.handleSubmit}>Add</Button>
					 </React.Fragment>}
					</Drawer.Body>
			</Drawer>
		 );
	}
}
 
const mapStateToProps = state => ({
	upgrades: getStored(state),
	lastFetch: state.entities.upgrades.lastFetch
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(UpgradeDrawer);