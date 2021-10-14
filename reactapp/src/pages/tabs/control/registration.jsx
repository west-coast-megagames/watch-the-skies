import axios from 'axios';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Content, Container, Sidebar, PanelGroup, Panel, Input, FlexboxGrid, List, Alert, SelectPicker, Button, Loader, Toggle, Divider, CheckPicker, TagPicker } from 'rsuite';
import socket from '../../../../src/socket';

class Registration extends Component {
	state = { 
		users: [],
		teams: [],
		value: [],
		selected: null,
		target: null,
		loading: true,
	}

	componentDidMount = async () => {
		try{
			const {data} = await axios.get(`https://nexus-central-server.herokuapp.com/api/users/`);
		//	Alert.success('Asset Successfully Deleted');
			this.setState({ loading: false, users: data, teams: this.props.teams });
		}
		catch (err) {
			console.log(err)
			// Alert.error(err.response.data ? `Error: ${err.response.data}` : `Error: ${err}`, 5000);
		}	
	}

	listStyle (item) {
		if (item === this.state.selected) {
			return ({cursor: 'pointer', backgroundColor: "#959292", color: 'white', })
		}
		else return ({cursor: 'pointer', backgroundColor: "#7C7C7C", color: 'white'}) 
	}

	handleSelect = (team) => {
		this.setState({ selected: team, value: team.users })
	}


	render() { 
		if (!this.props.login) {
			this.props.history.push('/');
			return (<Loader inverse center content="doot..." />)
		};
		return ( 
			<React.Fragment>
				<Container>
					<Content style={{ ...styleCenter, backgroundColor: "#343a40", color: 'white' }} >
					{this.state.selected && <React.Fragment>
							<Panel style={{padding: "0px", textAlign: "center", backgroundColor: "#343a40",}}>
								<b>id: {this.state.selected.name} </b>
								 <CheckPicker block placeholder='Select Units'
										data={this.state.users}
										onChange={value => this.setState({ value }) }
										valueKey='_id'
										labelKey='username'
										value={ this.state.value }
								/>	
								<Divider />
								<Button color='blue' disabled={(!this.state.selected)} onClick={()=> this.handleReg()} >Register this Player!</Button>		
							</Panel>
							<Panel>
													
							</Panel>
					</React.Fragment>}
					</Content>
					


						<Sidebar style={{ backgroundColor: "#343a40",  }}>
							<PanelGroup>					
								<Panel style={{  borderRadius: '0px', border: '1px solid #000000', backgroundColor: "#343a40",  }}>
									<Input onChange={(value)=> this.filter(value)} placeholder="Search"></Input>
								</Panel>
								<Panel bodyFill style={{height: 'calc(100vh - 183px)', borderRadius: '0px', overflow: 'auto', scrollbarWidth: 'none', borderRight: '1px solid rgba(255, 255, 255, 0.12)' }}>		
									{this.state.loading && <Loader/>}
									{!this.state.loading && this.state.teams && this.state.users && <List>			
											{this.state.teams
											// .sort((a, b) => { // sort the catagories alphabetically 
											// 	if(a.name < b.name) { return -1; }
											// 	if(a.name > b.name) { return 1; }
											// 	return 0;
											// })
											.map((team, index) => (
												<List.Item key={index} index={index} onClick={() => this.handleSelect(team)} style={this.listStyle(team)}>
													<FlexboxGrid>
														<FlexboxGrid.Item colspan={16} style={{...styleCenter, flexDirection: 'column', alignItems: 'flex-start', overflow: 'hidden'}}>
															<b style={titleStyle}>{team.name}</b>
														</FlexboxGrid.Item>
													</FlexboxGrid>
												</List.Item>
											))}
										</List>}			
								</Panel>							
							</PanelGroup>
						</Sidebar>	

				</Container>				
			</React.Fragment>

		);
	}

	filter = (fil) => {
			const unfiltered = this.state.users.filter(user => user.name.first.toLowerCase().includes(fil.toLowerCase()) ||
			user.name.last.toLowerCase().includes(fil.toLowerCase()) ||
			user.email.toLowerCase().includes(fil.toLowerCase()));
			this.setState({ unfiltered });		
		}

	handleReg = async () => {
		const data = {
			team: this.state.selected._id,
			users: this.state.value,
		}
		try{
			socket.emit('request', { route: 'team', action: 'register', data });
			this.setState({ selected: null, value: null });
		}
		catch (err) {
			console.log(err)
			Alert.error(`Error: ${err}`, 5000);
		}
	}

}

const styleCenter = {
	display: 'flex',
	justifyContent: 'center',

};

const titleStyle = {
	whiteSpace: 'nowrap',
	fontWeight: 500,
	paddingLeft: 10
};

const slimText = {
	fontSize: '0.986em',
	color: 'white',
	fontWeight: 'lighter',
	paddingBottom: 5,
	paddingLeft: 10
};

const mapStateToProps = (state) => ({
  login: state.auth.login,
	teams: state.entities.teams.list,
});

const mapDispatchToProps = (dispatch) => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(Registration);