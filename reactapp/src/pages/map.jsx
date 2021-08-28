import React, { Component } from 'react'; // React import
import { connect } from 'react-redux'; // Redux store provider
import { Nav, Container, Header, Content, Icon, CheckboxGroup, Checkbox } from 'rsuite';
// import { Route, Switch, NavLink, Redirect } from 'react-router-dom';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faShieldAlt, faRadiation, faGlobe, faFighterJet, faMap } from '@fortawesome/free-solid-svg-icons'
import LoginLink from '../components/common/loginLink'
import PrototypeMap from './tabs/ops/google2'

const MapPage = (props) => {
	const [sites, setSites] = React.useState(true);
	const [contacts, setContacts] = React.useState(true);
	const [military, setMilitary] = React.useState(true);
	const [intel, setIntel] = React.useState(true);

	if (!props.login) {
		props.history.push('/');
		return <LoginLink history={props.history} />
	}

  return (
		<Container>
			<Header>
				<CheckboxGroup inline name="checkboxList">
					<Checkbox onChange={() => setSites(!sites)} checked={sites}>Sites</Checkbox>
					<Checkbox onChange={() => setContacts(!contacts)} checked={contacts}>Contacts</Checkbox>
					<Checkbox onChange={() => setIntel(!intel)} checked={intel}>Intel</Checkbox>
					<Checkbox onChange={() => setMilitary(!military)} checked={military}>Military</Checkbox>
  			</CheckboxGroup>
			</Header>
			<Content className='tabContent' style={{ paddingLeft: 20 }}>
				<PrototypeMap siteBoolean={sites} contactBoolean={contacts} intelBoolean={intel} militaryBoolean={military} ></PrototypeMap>
			</Content>
		</Container>
    );
  
}

const mapStateToProps = state => ({
	login: state.auth.login,
	team: state.auth.team,
	sites: state.entities.sites.list,
	military: state.entities.military.list,
	aircraft: state.entities.aircrafts.list
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(MapPage);