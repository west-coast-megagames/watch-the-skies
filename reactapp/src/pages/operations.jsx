import React, { useEffect } from 'react'; // React import
import { connect } from 'react-redux'; // Redux store provider
import { Nav, Container, Header, Content, Button, Divider, Panel, FlexboxGrid, ButtonToolbar, ButtonGroup } from 'rsuite';
import { Route, Switch, NavLink, Redirect } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faRadiation, faBriefcase, faAtlas, faHandsHelping } from '@fortawesome/free-solid-svg-icons'
import LoginLink from '../components/common/loginLink'
import AssetsTab from './tabs/ops/AssetTab';
import { getFacilites } from '../store/entities/facilities';
import AircraftTable from './tabs/ops/asset/AircraftTable';
import FacilitiesTable from './tabs/ops/asset/FacilitiesTable';
import MilitaryTable from './tabs/ops/asset/MilitaryTable';
import BalanceHeader from '../components/common/BalanceHeader';
import { getOpsAccount } from '../store/entities/accounts';
import { getMilitary } from '../store/entities/military';
import MobilizeForm from './tabs/ops/asset/MobilizeForm';
import TransferForm from '../components/common/TransferForm';
import RecallForm from './tabs/ops/asset/RecallForm';
import { getAircrafts } from '../store/entities/aircrafts';
import IntelTab from './tabs/ops/IntelTab';
import Trade from './tabs/dip/trade'

/*
TODO CHECKLIST
[X] Players can assign Upgrades
[X] Players can un-assign Upgrades
[] Players can make Upgrades (? Possibly outside the scope of planned test) 
[X] Players can repair units
[X] Transfer Units
[X] Deploy Units
[X] Aggress Units
[] connect battles with alliances && multiple opposing armies 
*/

const Operations  = (props) => {
	const [tab, setTab] = React.useState('dashboard');
	const [selected, setSelected] = React.useState(undefined);
	const [show, setShow] = React.useState(false);
	const url = props.match.path;

	const handleTransfer = (thing) => {
		setSelected(thing);
		setTab('assets');
		props.history.push('/ops/assets');
	}

	if (!props.login) {
		props.history.push('/');
		return <LoginLink history={props.history} />
	}
  else return (
		<Container>
			<Header>
			<FlexboxGrid align="middle">
				<FlexboxGrid.Item colspan={20} >
					<Nav appearance="tabs" activeKey={ tab } onSelect={(thing) => setTab(thing)} style={{ marginBottom: 10 }}>
						<Nav.Item eventKey="dashboard" to={`${url}/dashboard`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faShieldAlt} />}> Dashboard</Nav.Item>
						<Nav.Item eventKey="trades" to={`${url}/trades`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faHandsHelping} />}> Trades</Nav.Item>
						<Nav.Item eventKey="assets" to={`${url}/assets`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faAtlas} />}> Asset Manager</Nav.Item>
						<Nav.Item eventKey="intel" to={`${url}/intel`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faBriefcase} />}> Intel</Nav.Item>
						<Nav.Item eventKey="nuclear" to={`${url}/nuclear`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faRadiation} />}> Nuclear</Nav.Item>
					</Nav>							
				</FlexboxGrid.Item>
				<FlexboxGrid.Item colspan={4}>
					<BalanceHeader account={props.account} />
					</FlexboxGrid.Item>
				</FlexboxGrid>
			</Header>
			
			<Content style={{ paddingLeft: '0px', overflow: 'auto'  }}>
				<Switch>
					<Route path={`${url}/dashboard`} render={() => (
						<FlexboxGrid justify="center">
							<FlexboxGrid.Item justify="center" style={{ 	textAlign: 'center'}} colspan={24} >
								<Panel bodyFill bordered style={{ border: "2px solid black", borderRadius: '0px',	textAlign: 'center'}}>
									<ButtonToolbar style={{ margin: '10px' }}>
										<ButtonGroup>
											<Button size='md' color={'green'} onClick={() => setShow('transfer')}>
												Transfer Units
											</Button>		
											<Button size='md' color={'orange'} style={{ color: 'black'}} onClick={() => setShow('mobilize')}>
												Mobilize Military
											</Button>			
											<Button size='md' color={'violet'} onClick={() => setShow('recall')}>
												Recall Military
											</Button>	
											<MobilizeForm hide={() => setShow(false)} show={show === 'mobilize'}/>	
											<RecallForm hide={() => setShow(false)} show={show === 'recall'}/>			
											<TransferForm 
												units={props.military}
												aircrafts={props.aircrafts}
												show={show === 'transfer'} 
												closeTransfer={() => setShow(false)}
												unit={props.unit} />		
										</ButtonGroup>
									</ButtonToolbar>
								</Panel>

							</FlexboxGrid.Item>
							<FlexboxGrid.Item colspan={13} >
								<Panel bodyFill bordered style={cardStyle}>
									<h5>Aircraft Operations</h5>
									<AircraftTable handleTransfer={handleTransfer} aircrafts={props.aircrafts}/>
								</Panel>
								<Panel bodyFill bordered style={cardStyle2}>
									<h5>Facilities</h5>
									<FacilitiesTable handleTransfer={handleTransfer}/>
								</Panel>
							</FlexboxGrid.Item>
							<FlexboxGrid.Item colspan={11} >
								<Panel bodyFill bordered style={cardStyle3}>
									<h5>Military</h5>
									<MilitaryTable handleTransfer={handleTransfer} military={props.military}/>
								</Panel>
							</FlexboxGrid.Item>
						</FlexboxGrid>
					)}/>

					<Route path={`${url}/assets`} render={() => (
						<AssetsTab selected={selected} history={props.history}/>
					)}/>
					<Route path={`${url}/trades`} render={() => (
						<Trade />
					)}/>
					<Route path={`${url}/intel`} render={() => (
						<IntelTab selected={selected} history={props.history}/>
					)}/>
					<Redirect from={`${url}/`} exact to={`${url}/dashboard`} />
				</Switch>
			</Content>
		</Container>
  );
  
}

const cardStyle = {
  border: "2px solid black",
	height: '45vh',
	borderRadius: '0px',
	textAlign: 'center'
}

const cardStyle2 = {
  border: "2px solid black",
	height: '35vh',
	borderRadius: '0px',
	textAlign: 'center'
}

const cardStyle3 = {
  border: "2px solid black",
	height: '80vh',
	borderRadius: '0px',
	textAlign: 'center'
}

const mapStateToProps = state => ({
	login: state.auth.login,
	team: state.auth.team,
	sites: state.entities.sites.list,
	military: getMilitary(state),
	aircrafts: getAircrafts(state),
	facilities: getFacilites(state),
	account: getOpsAccount(state)
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Operations);