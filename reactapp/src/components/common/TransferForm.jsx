import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Alert, Table, Drawer, List, Popover, Whisper, Icon, IconButton, Panel } from 'rsuite';
import { gameServer } from '../../config';
import { getStored } from '../../store/entities/upgrades';
import axios from 'axios';
import { socket } from '../../api';
import { getFacilites } from '../../store/entities/facilities';

const { HeaderCell, Cell, Column } = Table;

class TransferForm extends Component {
	state = { 
		selected: null
	 }


	handleSubmit = async () => {
		try{
			socket.emit( 'militarySocket', 'transfer', {facility: this.state.selected._id, unit: this.props.unit._id})
			this.props.closeTransfer()
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
				onHide={() => this.props.closeTransfer()}>
					<Drawer.Header>
						<Drawer.Title>Transfer to a Facility:</Drawer.Title>
					</Drawer.Header>
					<Drawer.Body>
						{!this.state.selected &&  <Panel bodyFill >
							<List hover autoScroll bordered style={{scrollbarWidth: 'none', textAlign: 'center', cursor: 'pointer' }}>
								{this.props.facilities.map((facility, index) => (
									<List.Item key={index} index={index} onClick={() => this.setState({ selected: facility })}>
										{facility.name}
									</List.Item>
								))}
							</List>							
						</Panel>}

						{this.state.selected && <React.Fragment>
						 <h4>{this.state.selected.name}</h4>
						 <b>Transfer {this.props.unit.name} to Facility {this.state.selected.name}?</b>
							<Button color="red"  onClick={()=> this.setState({selected: null})}>Reselect</Button>		
							<Button color="green"  onClick={this.handleSubmit}>Add</Button>
					 </React.Fragment>}
					</Drawer.Body>
			</Drawer>
		 );
	}
}
 
const mapStateToProps = state => ({
	facilities: getFacilites(state),
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(TransferForm);