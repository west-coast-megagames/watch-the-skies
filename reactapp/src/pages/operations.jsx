import React, { Component } from 'react'; // React import
import { Nav, Container, Header, Content, Button } from 'rsuite';
import { Route, Switch, NavLink, Redirect } from 'react-router-dom';
import Interception from './tabs/ops/interceptions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faRadiation, faGlobe, faFighterJet, faMap } from '@fortawesome/free-solid-svg-icons'
import GlobalOps from './tabs/ops/global';
import Globe from './tabs/ops/globe_example';
import Flat from './tabs/ops/flat_map';
import LoginLink from '../components/common/loginLink'
import playTrack from './../scripts/audio';
import ExcomOps from './tabs/ops/excom';

class Operations extends Component {
    constructor() {
        super();
        this.state = {
          tab: 'dashboard',
          account: {},
          markers: []
        };
        this.handleSelect = this.handleSelect.bind(this);
        this.setAccount = this.setAccount.bind(this);
        this.setMarkers = this.setMarkers.bind(this);
    }

    componentDidMount() {
        this.setAccount();
        this.setMarkers();
    }

    setMarkers() {
        let markers = [];
        let i = 0;
        for (let site of this.props.sites) {
            let marker = {
                id: i,
                type: site.type,
                coordinates: [ site.geoDecimal.latDecimal, site.geoDecimal.longDecimal],
                name: site.name,
                color: site.type === 'City' ? 'red' : 'blue',
                value: site.type === 'City' ? 5 : 2
            }
            markers.push(marker);
            i++
        }
        this.setState({markers});
    }

    setAccount() {
        let indexOf = this.props.accounts.findIndex(el => el.name === 'Operations');
        let account = this.props.accounts[indexOf];
        this.setState({ account })
    }

    handleSelect(activeKey) {
        this.setState({ tab: activeKey })
    }

    render() {
        if (!this.props.login) return <LoginLink history={this.props.history} />
        const url = this.props.match.path;
        const { tab } = this.state; 

         return (
        <Container>
            <Header>
                <Nav appearance="tabs" activeKey={ tab } onSelect={this.handleSelect} style={{ marginBottom: 10 }}>
                    <Nav.Item eventKey="dashboard" to={`${url}/dashboard`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faShieldAlt} />}> Dashboard</Nav.Item>
                    <Nav.Item eventKey="excom" to={`${url}/excom`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faFighterJet} />}> Excom Ops</Nav.Item>
                    <Nav.Item eventKey="globe" to={`${url}/globe`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faGlobe} />}> Global Ops</Nav.Item>
                    <Nav.Item eventKey="nuclear" to={`${url}/nuclear`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faRadiation} />}> Nuclear</Nav.Item>
                    <Nav.Item eventKey='globe_map' to={`${url}/globe_map`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faGlobe} />}> Globe Map</Nav.Item>
                    <Nav.Item eventKey='flat_map' to={`${url}/flat_map`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faMap} />}> Flat Map</Nav.Item>
                </Nav>
            </Header>
            <Content className='tabContent' style={{ paddingLeft: 20 }}>
                <Switch>
                    <Route path={`${url}/dashboard`} render={() => (
                        <div>
                            <h5>No dashboard has been coded for the Operations Module!</h5>
                            <hr />
                            <u><b>Implemented Features</b></u>
                            <ul>
                                <li>Interceptions [Excom Ops]</li>
                            </ul>
                            <u><b>Unimplemented Features</b></u>
                            <ul>
                                <li>Nuclear Launches [Nuclear]</li>
                                <li>Ground Military [Global Ops]</li>
                                <li>Satillites</li>
                            </ul>
                            <u><b>Test Features</b></u>
                            <ul>
                                <li>Global Map [Globe Map]</li>
                                <li>Flat Map [SVG map]</li>
                                <li>Ground Military [Global Ops]</li>
                                <li>Satillites</li>
                            </ul>
                        </div>
                    )}/>
                    <Route path={`${url}/excom`} render={() => (
                        <ExcomOps
                            sites={ this.props.sites }
                            team={ this.props.team }
                            aircrafts={ this.props.aircrafts }
                            alert={ this.props.alert }
                            zones={this.props.zones}
                            account={ this.state.account }
                        /> 
                    )}/>
                    <Route path={`${url}/globe`} render={() => (
                        <GlobalOps
                            team={ this.props.team }
                            teams={ this.props.teams }
                            accounts={ this.props.accounts }
                            zones={ this.props.zones }
                            countries={ this.props.countries }
                            sites={ this.props.sites }
                            aircrafts={ this.props.sites }
                            military={ this.props.military }
                            notify={ this.props.alert }
                        />
                    )}/>
                    <Route path={`${url}/nuclear`} render={() => (
                        <div style={{verticalAlign:'middle', position: 'relative'}}>
                            <Button block size='lg' color='red' onClick={() => playTrack('nuclear')} >DO NOT PRESS!</Button>
                        </div>
                    )}/>
                    <Route path={`${url}/globe_map`} render={() => (
                        <Globe 
                            sites={ this.props.sites }
                            markers={ this.state.markers }
                        />
                    )}/>
                    <Route path={`${url}/flat_map`} render={() => (
                        <Flat />
                    )}/>
                    <Redirect from={`${url}/`} exact to={`${url}/dashboard`} />
                </Switch>
            </Content>
        </Container>
         );
    }
 }

export default Operations;