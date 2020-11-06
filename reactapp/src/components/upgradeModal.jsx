import React, { Component } from 'react';
import { connect } from 'react-redux'; // Redux store provider
import { FlexboxGrid, Drawer, SelectPicker, CheckPicker, Divider, Toggle, Alert, Button } from 'rsuite';
import { getCities, getBases } from "../store/entities/sites";
import { gameServer } from '../config';
import axios from 'axios';

class UpgradeModal extends Component {
	constructor(props) {
		super(props);
		this.state = {
				unit: this.props.selected,
				selected: null,
				hidden: true,
		};
		console.log(this)
};

	
	handleSelect = async (blueprint) => { 
		if (!blueprint) {
			this.setState({ selected: null, hidden: true });
			return;
		}
		let {data} = await axios.get(`${gameServer}api/blueprints/${blueprint}`);
		this.setState({ selected: data, hidden: false });
	}

	handleSubmit = async (blueprint) => {
		// 1) make a new upgrade from blueprint
		try{
			let { data } = await axios.post(`${gameServer}api/upgrades/`, {code: this.state.selected.code, team: this.props.team, facility: 'TEST FACILITY'})
			console.log(data);
			await axios.put(`${gameServer}game/upgrades/add`, {upgrade: data._id, unit: this.props.unit._id })
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
					<Drawer.Title>Create New Upgrade</Drawer.Title>
					<SelectPicker 
						data={this.props.blueprints.filter(el => el.buildModel === 'upgrade')} 
						onChange={this.handleSelect} 
						style={{ width: 250 }} 
						valueKey="_id"
						labelKey="name"
						value={this.state.picked}
					/>	
			</Drawer.Header>
			{this.state.selected && <Drawer.Body>
				<FlexboxGrid>
						<FlexboxGrid.Item colspan={6}>
                <p>
                  <b>Desc:</b> {this.state.selected.desc}
                </p>
              </FlexboxGrid.Item>
              <FlexboxGrid.Item colspan={12}>
                <p>
                  <b>_id:</b> {this.state.selected._id}
                </p>
                <p>
                  <b>Unit Type:</b> {this.state.selected.unitType} 
                </p>
              </FlexboxGrid.Item>
              <FlexboxGrid.Item colspan={12}>
								<p>
                  <b>Code:</b> {this.state.selected.code} 
                </p>
								<p>
                  <b>Cost:</b> {this.state.selected.cost} 
                </p>
              </FlexboxGrid.Item>
            </FlexboxGrid>
			</Drawer.Body>}
			
			{this.state.selected && <Drawer.Footer>
				<Button color="green" style={{ marginLeft: "auto" }} onClick={this.handleSubmit}>Submit</Button>		
			</Drawer.Footer>}
			
	</Drawer>
		 );
	}
}
 
const mapStateToProps = state => ({
	login: state.auth.login,
	team: state.auth.team,
	sites: state.entities.sites.list,
	military: state.entities.military.list,
	blueprints: state.entities.blueprints.list,
	citySites: getCities(state),
	// baseSites: getBases(state)
	});
	
const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(UpgradeModal);