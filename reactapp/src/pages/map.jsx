import React, { useEffect } from 'react'; // React import
import { connect } from 'react-redux'; // Redux store provider
import { Nav, Container, Header, Content, SelectPicker, CheckboxGroup, Checkbox, FlexboxGrid, Alert } from 'rsuite';
// import { Route, Switch, NavLink, Redirect } from 'react-router-dom';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faShieldAlt, faRadiation, faGlobe, faFighterJet, faMap } from '@fortawesome/free-solid-svg-icons'
import LoginLink from '../components/common/loginLink'
import { getCapitol } from '../store/entities/sites';
import PrototypeMap from './tabs/ops/google2'

const MapPage = (props) => {
	const [sites, setSites] = React.useState(true);
	const [contacts, setContacts] = React.useState(true);
	const [military, setMilitary] = React.useState(true);
	const [intel, setIntel] = React.useState(true);
	const [center, setCenter] = React.useState({ lat: 0,	lng: 0	});

	const handleThing = (value) => {
		const site = props.sites.find(el => el._id === value);
		if ( site && site.geoDecimal && site.geoDecimal.lat && site.geoDecimal.lng) {
			setCenter({ lat: site.geoDecimal.lat, lng:  site.geoDecimal.lng });
		}
		else {
			Alert.error('No Geo Data Found', 6000);
		}
		
	}

	useEffect(() => {
		if (props.capitol) {
				setCenter({ lat: props.capitol.geoDecimal.lat, lng: props.capitol.geoDecimal.lng });
		}
	}, []);

	if (!props.login) {
		props.history.push('/');
		return <LoginLink history={props.history} />
	}

  return (
		<Container>
				<FlexboxGrid justify="space-around" align="middle">
					<FlexboxGrid.Item colspan={12}>
						<CheckboxGroup inline name="checkboxList">
							<Checkbox onChange={() => setSites(!sites)} checked={sites}>Sites</Checkbox>
							<Checkbox onChange={() => setContacts(!contacts)} checked={contacts}>Contacts</Checkbox>
							<Checkbox onChange={() => setIntel(!intel)} checked={intel}>Intel</Checkbox>
							<Checkbox onChange={() => setMilitary(!military)} checked={military}>Military</Checkbox>		
						</CheckboxGroup>	
					</FlexboxGrid.Item>

					<FlexboxGrid.Item colspan={12}>
					<SelectPicker
   				  data={props.sites}
						valueKey='_id'
						labelKey='name'
						appearance="default"
						placeholder="Find a Site"
						style={{ width: 224 }}
						onChange={(value) => handleThing(value)}
					/>
					</FlexboxGrid.Item>
				</FlexboxGrid>
			<Content className='tabContent' style={{ paddingLeft: 20 }}>
				<PrototypeMap siteBoolean={sites} contactBoolean={contacts} intelBoolean={intel} militaryBoolean={military} center={center}></PrototypeMap>
			</Content>
		</Container>
    );
  
}

const mapStateToProps = state => ({
	login: state.auth.login,
	team: state.auth.team,
	sites: state.entities.sites.list,
	capitol: getCapitol(state),
	military: state.entities.military.list,
	aircraft: state.entities.aircrafts.list
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(MapPage);