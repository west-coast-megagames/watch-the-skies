import React, { useEffect } from 'react'; // React import
import { connect } from 'react-redux'; // Redux store provider
import { Nav, Container, Header, Content, Button, Divider, Panel, FlexboxGrid } from 'rsuite';
import { Route, Switch, NavLink, Redirect } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faRadiation, faGlobe, faAtlas } from '@fortawesome/free-solid-svg-icons'
import LoginLink from '../components/common/loginLink'
import AssetsTab from './tabs/ops/AssetTab';
import { getFacilites } from '../store/entities/facilities';
import AircraftTable from './tabs/ops/asset/AircraftTable';
import FacilitiesTable from './tabs/ops/asset/FacilitiesTable';
import MilitaryTable from './tabs/ops/asset/MilitaryTable';
import BalanceHeader from '../components/common/BalanceHeader';
import { getOpsAccount } from '../store/entities/accounts';
import { getMilitary } from '../store/entities/military';

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
	const url = props.match.path;

	const handleTransfer = (thing) => {
		setSelected(thing);
		setTab('unit');
		props.history.push('/control/unit');
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
						<Nav.Item eventKey="assets" to={`${url}/assets`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faAtlas} />}> Asset Manager</Nav.Item>
						<Nav.Item eventKey="nuclear" to={`${url}/nuclear`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faRadiation} />}> Nuclear</Nav.Item>
					</Nav>							
				</FlexboxGrid.Item>
				<FlexboxGrid.Item colspan={4}>
					<BalanceHeader account={props.account} />
					</FlexboxGrid.Item>
				</FlexboxGrid>
			</Header>
			
			<Content style={{ paddingLeft: '0px', overflow: 'auto' }}>
				<Switch>
					<Route path={`${url}/dashboard`} render={() => (
						<FlexboxGrid>
							<FlexboxGrid.Item colspan={13} >
								<Panel bodyFill bordered style={cardStyle}>
									<h5>Aircraft Operations</h5>
									<AircraftTable handleTransfer={handleTransfer} />
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
						<AssetsTab selected={selected} />
					)}/>
					<Redirect from={`${url}/`} exact to={`${url}/dashboard`} />
				</Switch>
			</Content>
		</Container>
  );
  
}

const cardStyle = {
  border: "2px solid black",
	height: '50vh',
	borderRadius: '0px',
	textAlign: 'center'
}

const cardStyle2 = {
  border: "2px solid black",
	height: '39vh',
	borderRadius: '0px',
	textAlign: 'center'
}

const cardStyle3 = {
  border: "2px solid black",
	height: '89vh',
	borderRadius: '0px',
	textAlign: 'center'
}

const mapStateToProps = state => ({
	login: state.auth.login,
	team: state.auth.team,
	sites: state.entities.sites.list,
	military: getMilitary(state),
	aircraft: state.entities.aircrafts.list,
	facilities: getFacilites(state),
	account: getOpsAccount(state)
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Operations);