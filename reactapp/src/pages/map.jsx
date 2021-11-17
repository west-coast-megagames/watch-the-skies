import React, { useEffect } from 'react'; // React import
import { connect } from 'react-redux'; // Redux store provider
import { Nav, Container, Header, Content, SelectPicker, CheckboxGroup, Checkbox, FlexboxGrid, Alert, CheckTreePicker } from 'rsuite';
import BalanceHeader from '../components/common/BalanceHeader';
// import { Route, Switch, NavLink, Redirect } from 'react-router-dom';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faShieldAlt, faRadiation, faGlobe, faFighterJet, faMap } from '@fortawesome/free-solid-svg-icons'
import LoginLink from '../components/common/loginLink'
import { getOpsAccount } from '../store/entities/accounts';
import { getCapitol } from '../store/entities/sites';
import PrototypeMap from './tabs/ops/google2'

const MapPage = (props) => {
	const [center, setCenter] = React.useState({ lat: 0,	lng: 0	});
	const [display, setDisplay] = React.useState(['sites', 'military', 'contacts']);

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

	const handleDis = (dis) => {
		setDisplay(dis);
	};

	if (!props.login) {
		props.history.push('/');
		return <LoginLink history={props.history} />
	}
  return (
		<Container>
				<FlexboxGrid justify="space-around" align="middle">
					<FlexboxGrid.Item colspan={12}>
						<CheckTreePicker 
							defaultExpandAll
							data={data}
							defaultValue={display}
							placeholder="Select Map Elements"
							valueKey='value'
							onChange={handleDis}
						/>
					</FlexboxGrid.Item>

					<FlexboxGrid.Item colspan={8}>
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

					<FlexboxGrid.Item colspan={4}>
						<BalanceHeader account={props.account} />
					</FlexboxGrid.Item>
					
				</FlexboxGrid>
			<Content className='tabContent' style={{ paddingLeft: 20 }}>
				<PrototypeMap display={display} center={center}></PrototypeMap>
			</Content>
		</Container>
    );
}

const data = [
	{
		label: "Sites",
    value: "sites",
    "children": [
			{
        label: "Cities",
        value: 'City'
      },
			{
        label: "Satellites",
        value: 'Satellite'
      },
			{
        label: "Points of Interest",
        value: 'Point of Interest'
      },
			{
        label: "Crash Sites",
        value: 'Crash'
      },
		]
	},
	{
		label: "Air Contacts",
    value: "contacts",
    "children": [
			{
        label: "Interceptors",
        value: 'interceptors'
      },
			{
        label: "Aliens",
        value: 'aliens'
      },
		]
	},
	{
		label: "Intel",
    value: "intel",
    "children": [

		]
	},
	{
		label: "Military",
    value: "military",
    // "children": [
		// 	{
    //     label: "Deployed",
    //     value: 'deployed'
    //   },
		// 	{
    //     label: "Un-Deployed",
    //     value: 'undeployed'
    //   },
		// ]
	},
]

const mapStateToProps = state => ({
	login: state.auth.login,
	team: state.auth.team,
	sites: state.entities.sites.list,
	capitol: state.auth.team.type !== 'Control' ? getCapitol(state) : undefined,
	military: state.entities.military.list,
	aircraft: state.entities.aircrafts.list,
	account: getOpsAccount(state)
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(MapPage);