import React, { useEffect } from 'react'; // React import
import { connect } from 'react-redux'; // Redux store provider
import { Nav, Container, Header, Content, Button, Divider, Panel, FlexboxGrid } from 'rsuite';
import { Route, Switch, NavLink, Redirect } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faRadiation, faGlobe, faAtlas } from '@fortawesome/free-solid-svg-icons'
import LoginLink from '../components/common/loginLink'
import playTrack from './../scripts/audio';
import PrototypeMap from './tabs/ops/google2';
import AssetsTab from './tabs/ops/assets';
import AircraftTable from '../components/aircraftTable';

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
	const url = props.match.path;

	if (!props.login) {
		props.history.push('/');
		return <LoginLink history={props.history} />
	}
  else return (
		<Container>
			<Header>
				<Nav appearance="tabs" activeKey={ tab } onSelect={(thing) => setTab(thing)} style={{ marginBottom: 10 }}>
					<Nav.Item eventKey="dashboard" to={`${url}/dashboard`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faShieldAlt} />}> Dashboard</Nav.Item>
					<Nav.Item eventKey="assets" to={`${url}/assets`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faAtlas} />}> Asset Manager</Nav.Item>
					<Nav.Item eventKey="nuclear" to={`${url}/nuclear`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faRadiation} />}> Nuclear</Nav.Item>
				</Nav>
			</Header>
			<Content style={{ paddingLeft: '0px', overflow: 'auto' }}>
				<FlexboxGrid>
					<FlexboxGrid.Item colspan={16} >
						<Panel bodyFill bordered style={cardStyle}>
							<h5>Aircraft Operations</h5>
							<AircraftTable/>
						</Panel>
					</FlexboxGrid.Item>
					<FlexboxGrid.Item colspan={8} >
						<div>

						</div>
					</FlexboxGrid.Item>
				</FlexboxGrid>


			</Content>
		</Container>
  );
  
}

const cardStyle = {
  border: "5px solid black",
	height: '50vh',
	textAlign: 'center'
}

const mapStateToProps = state => ({
login: state.auth.login,
team: state.auth.team,
sites: state.entities.sites.list,
military: state.entities.military.list,
aircraft: state.entities.aircrafts.list
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Operations);