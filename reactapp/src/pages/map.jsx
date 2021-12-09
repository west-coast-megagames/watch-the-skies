import React, { useEffect } from 'react'; // React import
import { connect } from 'react-redux'; // Redux store provider
import { Nav, Container, Header, Content, SelectPicker, CheckboxGroup, Checkbox, FlexboxGrid, Alert, CheckTreePicker, Toggle, Icon, Button, ButtonToolbar, ButtonGroup, IconButton, Panel, Whisper, Popover } from 'rsuite';
import BalanceHeader from '../components/common/BalanceHeader';
import { Route, Switch, NavLink, Redirect } from 'react-router-dom';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faShieldAlt, faRadiation, faGlobe, faFighterJet, faMap } from '@fortawesome/free-solid-svg-icons'
import LoginLink from '../components/common/loginLink'
import { getOpsAccount } from '../store/entities/accounts';
import { showSite } from '../store/entities/infoPanels';
import { getCapitol } from '../store/entities/sites';
import PrototypeMap from './tabs/ops/google2'
import { getMyTeam } from '../store/entities/teams';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons';
import TransferForm from '../components/common/TransferForm';
import { getMilitary } from '../store/entities/military';
import { getAircrafts } from '../store/entities/aircrafts';
import MobilizeForm from './tabs/ops/asset/MobilizeForm';
import RecallForm from './tabs/ops/asset/RecallForm';

const MapPage = (props) => {
	const [tab, setTab] = React.useState('earth');
	const [center, setCenter] = React.useState({ lat: 0,	lng: 0	});
	const [showRange, setShowRange] = React.useState(true);
	const [showSearch, setShowSearch] = React.useState(false);
	const [showFilter, setShowFilter] = React.useState(false);
	const [display, setDisplay] = React.useState(['sites', 'military', 'contacts', 'Satellite']);
	const [show, setShow] = React.useState(false);
	const url = props.match.path;

	const handleCenter = (value) => {
		const military = props.military.find(el => el._id === value);
		const site = props.sites.find(el => el._id === value);
		const air = props.aircrafts.find(el => el._id === value);
		if ( site && site.geoDecimal && site.geoDecimal.lat && site.geoDecimal.lng) {
			setCenter({ lat: site.geoDecimal.lat, lng:  site.geoDecimal.lng });
		}
		else if ( military && military.location && military.location.lat && military.location.lng) {
			setCenter(military.location);
		}
		else if ( air && air.location && air.location.lat && air.location.lng) {
			setCenter(air.location);
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

	useEffect(() => {
		if (props.site && props.site.geoDecimal) {
			setCenter({ lat: props.site.geoDecimal.lat, lng:  props.site.geoDecimal.lng });
		}
	}, [props.site]);

	useEffect(() => {
		if (props.milTransfer) {
			setCenter(props.milTransfer.location);
		}
	}, [props.milTransfer]);

	useEffect(() => {
		if (props.airTransfer) {
			setCenter(props.airTransfer.location);
		}
	}, [props.airTransfer]);


	const handleDis = (dis) => {
		setDisplay(dis);
	};

	const renderButtonPopup = () => {
		return (
			<Popover style={{ backgroundColor: '#090f1a'}}>
				<ButtonGroup>
					<Whisper delay={150} placement="bottom" speaker={(<Popover>Transfer Units</Popover>)} trigger="hover">
					<Button color={'green'} onClick={() => setShow('transfer')}><FontAwesomeIcon icon={faExchangeAlt} /></Button>		
				</Whisper> 

				<Whisper delay={150} placement="bottom" speaker={(<Popover >Mobilize Military</Popover>)} trigger="hover">
					<Button color={'orange'} onClick={() => setShow('mobilize')}><FontAwesomeIcon icon={faExchangeAlt} /></Button>		
				</Whisper> 

				<Whisper delay={150} placement="bottom" speaker={(<Popover >Recall Military</Popover>)} trigger="hover">
					<Button color={'violet'} onClick={() => setShow('recall')}><FontAwesomeIcon icon={faExchangeAlt} /></Button>		
				</Whisper> 					
				</ButtonGroup>
				
			 </Popover>

		)
	}

	if (!props.login) {
		props.history.push('/');
		return <LoginLink history={props.history} />
	}
  else return (
		<Container>
			<Header>
			<FlexboxGrid align="middle">
				<FlexboxGrid.Item colspan={6} >
					<Nav appearance="tabs" activeKey={ tab } onSelect={(thing) => setTab(thing)} style={{ marginBottom: 10 }}>
						<Nav.Item eventKey="earth" to={`${url}/earth`} componentClass={NavLink} icon={<Icon icon={'globe'} />}>Earth</Nav.Item>
					</Nav>							
				</FlexboxGrid.Item>

				<FlexboxGrid.Item  style={{ textAlign: 'right' }} colspan={4}>
					{showSearch && <SelectPicker
						data={props.sites}
						valueKey='_id'
						labelKey='name'
						appearance="default"
						placeholder="Find a Site"
						style={{ borderRadius: '0px', backgroundColor: '#3498ff', width: '200px' }}
						onChange={(value) => handleCenter(value)}
					/> }	
				</FlexboxGrid.Item>
				
					<ButtonGroup >
						<Whisper delay={150} placement="bottom" speaker={(<Popover>Search Sites</Popover>)} trigger="hover">
							<IconButton style={!showSearch ? {  } : { borderRadius: '0px', }} onClick={() => setShowSearch(!showSearch)} appearance={showSearch ? 'primary' : "ghost"} icon={<Icon icon='search' /> } ></IconButton>	
						</Whisper> 
						
						<Whisper placement="bottom" trigger="click" controlId="control-id-click" speaker={renderButtonPopup()}>
							<Button color={'violet'} ><Icon icon="plane"/></Button>		
						</Whisper> 


						<Whisper delay={150} placement="bottom" speaker={(<Popover>{showRange ? "Hide Intel Range" : "Show Intel Range"}</Popover>)} trigger="hover">
							<IconButton color='green' onClick={() => setShowRange(!showRange)} appearance={showRange ? 'primary' : "ghost"} icon={showRange ? <Icon icon='eye-slash' /> : <Icon icon='eye' /> } ></IconButton>	
						</Whisper> 

						<Whisper delay={150} placement="bottom" speaker={(<Popover>Filter Map</Popover>)} trigger="hover">
							<IconButton style={!showFilter ? {  } : { borderRadius: '0px' }} onClick={() => setShowFilter(!showFilter)} appearance={showFilter ? 'primary' : "ghost"} icon={<Icon icon='filter' />} ></IconButton>
						</Whisper> 
					</ButtonGroup>

				<FlexboxGrid.Item colspan={4}>
						{showFilter && <CheckTreePicker 
							style={{ borderRadius: '0px', backgroundColor: '#3498ff', width: '300px' }}
							menuStyle={{ width: '300px' }}
							defaultExpandAll
							data={data}
							defaultValue={display}
							placeholder="Select Map Elements"
							valueKey='value'
							onChange={handleDis}
						/>}
						{!showFilter && <div style={{ borderRadius: '0px', backgroundColor: '#3498ff', width: '200px' }}></div>}
				</FlexboxGrid.Item>

				<FlexboxGrid.Item colspan={7}>
					<BalanceHeader account={props.account} />
					</FlexboxGrid.Item>
				</FlexboxGrid>
			</Header>

			<Content className='tabContent' style={{ paddingLeft: 0 }}>
			<Switch>
					<Route path={`${url}/earth`} render={() => (
						<PrototypeMap setCenter={(value) => handleCenter(value)} display={display} showRange={showRange} center={center}></PrototypeMap>
					)}/>
					<Redirect from={`${url}/`} exact to={`${url}/earth`} />
				</Switch>

				<TransferForm 
					units={props.military}
					aircrafts={props.aircrafts}
					show={show === 'transfer'} 
					closeTransfer={() => setShow(false)}
					unit={props.unit} />	
				<MobilizeForm hide={() => setShow(false)} show={show === 'mobilize'}/>	
				<RecallForm hide={() => setShow(false)} show={show === 'recall'}/>		
			</Content>
		</Container>
    );
}

const data = [
	{
		label: "Satellites",
		value: 'Satellite'
	},
	{
		label: "Sites",
    value: "sites",
    "children": [
			{
        label: "Cities",
        value: 'City'
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
        label: "Our Interceptors",
        value: 'ourAir'
      },
			{
        label: "Interceptors Intel",
        value: 'theirAir'
      },
			// {
      //   label: "Alien Intel",
      //   value: 'aliens'
      // },
		]
	},
	{
		label: "Military",
    value: "military",
    "children": [
			{
        label: "Our Military",
        value: 'ourMil'
      },
			{
        label: "Military Intel",
        value: 'theirMil'
      },
		]
	},
]

const mapStateToProps = state => ({
	login: state.auth.login,
	team: getMyTeam(state),
	sites: state.entities.sites.list,
	capitol: getCapitol(state),
	military: getMilitary(state),
	aircrafts: getAircrafts(state),
	account: getOpsAccount(state),
	site: state.info.Site,
	milTransfer: state.info.Military,
	airTransfer: state.info.Aircraft
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(MapPage);