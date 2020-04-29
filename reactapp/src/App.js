import React, { Component } from 'react'; // React
import { Header, Sidenav, Navbar, Sidebar, Container, Dropdown, Icon, Nav, Content, Alert } from 'rsuite';
import { Route, Switch, Redirect, NavLink } from 'react-router-dom';
import { updateEvents, clockSocket, updateSocket, gameClock } from './api'
import playTrack from './scripts/audio';
import jwtDecode from 'jwt-decode'
import { gameServer } from './config';
import axios from 'axios';

// Components
import NavBar from './components/navBar';
import Registration from './components/registration';
import AlertPage from './components/common/alert';

// Pages
import Governance from './pages/governance';
import Home from './pages/home';
import Control from './pages/control';
import NotFound from './pages/404';
import MoshTest from './pages/mosh'; // Mosh test
import Operations from "./pages/operations";
import Science from './pages/science';
import Diplomacy from './pages/diplomacy';
import News from './pages/news';
import Models from './pages/models';

// Cascading Style Sheets - App.js | Bootstrap | Fontawesome | rsuite
import 'bootstrap/dist/css/bootstrap.css'; //only used for global nav (black bar)
import 'font-awesome/css/font-awesome.css';
import 'rsuite/dist/styles/rsuite-default.css';
// import 'rsuite/dist/styles/rsuite-dark.css';
import './App.css';



const iconStyles = { width: 56, height: 56, lineHeight: '56px', textAlign: 'center' };
let idCount = 0;

// React App Component
class App extends Component {
  state = {
    clock: {
      minutes: '00',
      seconds: '00',
      turn: null
    },
    login: false,
    user: {},
    team: null,
    teams: [],
    zones: [],
    countries: [],
    sites: [],
    military: [],
    facilities: [],
    aircrafts: [],
    accounts: [],
    megabucks: 0,
    alerts: [],
    articles: [],
    expand: true,
    active: '1'
  }

  handleToggle = () => {
    this.setState({
      expand: !this.state.expand
    });
  }

  handleSelect = (activeKey) => {
    this.setState({ active: activeKey });
  }

  setKey = (key) => {
    this.setState({ active: key })
  }

  componentDidMount() {
    this.loadState(); //Get all teams, aircraft, sites, articles in DB and store to state
    updateEvents.updateTeam((err, team) => {
      if(this.state.team.name !== "Select Team") {
        this.setState({ team });
      }
    });

    updateEvents.updateAircrafts((err, aircrafts) => {
      this.addAlert({type: 'success', title: 'Aircrafts Update', body: `The aircrafts for ${this.state.team.name} have been updated...`});
      this.setState({ aircrafts });
    });

    updateEvents.updateAccounts((err, accounts) => {
      accounts = accounts.filter(a => a.team === this.state.team._id);
      let accountIndex = accounts.findIndex(account => account.name === 'Treasury');
      let megabucks = 0;
      accountIndex < 0 ? megabucks = 0 : megabucks = accounts[accountIndex].balance;
      this.addAlert({type: 'success', title: 'Accounts Update', body: `The accounts for ${this.state.team.name} have been updated...`});
      this.setState({ accounts, megabucks });
    });

    updateEvents.updateMilitary((err, military) => {
      this.addAlert({type: 'success', title: 'Military Update', body: `The current state of military has been updated...`});
      this.setState({ military });
    });

    updateEvents.updateFacilities((err, facilities) => {
      this.addAlert({type: 'success', title: 'Facilities Update', body: `The current state facilities has been updated...`});
      this.setState({facilities})
    });

    gameClock.subscribeToClock((err, clock) => {
      if(this.state.turn !== 'Test Turn' && this.state.turnNum !== clock.turnNum && this.state.team !== null) {
          updateEvents.updateTeam(this.state.team._id);
      }
      this.setState({clock})
    })
  }

  render() {
    const { expand, active, team } = this.state;

    return(
        <div className="App" style={{ position: 'fixed', top: 0, bottom: 0, width: '100%' }}>
          <Header>
            <NavBar
              clock={ this.state.clock }
              team={ this.state.team }
              megabucks={ this.state.megabucks }
            />
          </Header>
          <Container>
          <Sidebar
            style={{ display: 'flex', flexDirection: 'column' }}
            width={expand ? 200 : 56}
            collapsible
          >
            <Sidenav
              expanded={expand}
              defaultOpenKeys={['9']}
              appearance="subtle"
              activeKey={active}
              onSelect={this.handleSelect}
            >
              <Sidenav.Body>
                <Nav>
                  <Nav.Item eventKey="1" to="/gov" componentClass={NavLink} icon={<Icon icon="bank" />}>Governance</Nav.Item>
                  <Nav.Item eventKey="2" to="/ops" componentClass={NavLink} icon={<Icon icon="globe2" />}>Operations</Nav.Item>
                  <Nav.Item eventKey="3" to="/sci" componentClass={NavLink} icon={<Icon icon="flask" />}>Science</Nav.Item>
                  {/*<Nav.Item eventKey="4" to="/dip" componentClass={NavLink} icon={<Icon icon="handshake-o" />}>Diplomacy</Nav.Item>*/}
                  <Nav.Item eventKey="6" to="/news" componentClass={NavLink} icon={<Icon icon="newspaper-o" />}>News</Nav.Item>
                  <Nav.Item eventKey="7" to="/home" componentClass={NavLink} icon={<Icon icon="info-circle" />}>Info</Nav.Item>
                  {team !== null ? team.name === 'Control Team' && <Nav.Item eventKey="8" to="/control" componentClass={NavLink} icon={<Icon icon="ge" />}>Control</Nav.Item> : null}
                </Nav>
              </Sidenav.Body>
            </Sidenav>
            <NavToggle login={this.state.login} expand={expand} onChange={this.handleToggle} signOut={this.handleSignout} />
            </Sidebar>
            <Content>
                <Switch>
                    <Route path="/login" render={(props) => (
                      <Registration {...props}
                        addAlert={ this.addAlert }
                        handleLogin={ this.handleLogin }
                        login={ this.state.login }
                      />
                    )}/>
                    <Route path="/home" render={(props) => (
                      <Home {...props}
                          login={ this.state.login }
                          teams={ this.state.teams }
                          onChange={ this.handleLogin }
                      />
                    )} />
                    <Route path="/ops" render={(props) => (
                      <Operations {...props}
                        team={ this.state.team }
                        teams={ this.state.teams }
                        accounts={ this.state.accounts }
                        zones={ this.state.zones }
                        countries={ this.state.countries }
                        facilities={ this.state.facilities }
                        sites={ this.state.sites }
                        aircrafts={ this.state.aircrafts }
                        military={ this.state.military }
                        alert={ this.addAlert }
                        login={ this.state.login }
                      />
                    )} />
                    <Route path="/gov" render={(props) => (
                      <Governance {...props}
                          team = { this.state.team }
                          teams = { this.state.teams }
                          accounts = { this.state.accounts }
                          alert={ this.addAlert }
                          login={ this.state.login }
                      />
                    )}/>
                    <Route path="/sci" render={(props) => (
                      <Science {...props}
                          sites={ this.state.sites }
                          accounts={ this.state.accounts }
                          facilities={ this.state.facilities }
                          team={ this.state.team }
                          alert={ this.addAlert }
                          research={ this.state.research }
                          login={ this.state.login }
                      />
                    )}/>
                    <Route path="/dip" render={(props) => (
                      <Diplomacy {...props}
                          team = { this.state.team }
                          alert={ this.addAlert }
                          login={ this.state.login }
                      />
                    )}/>
                    <Route path="/news" render={(props) => (
                      <News {...props} {...this.state}
                        articles={ this.state.articles }
                        alert={ this.addAlert }
                        teams={ this.state.teams }
                        team={ this.state.team }
                        sites={ this.state.sites }
                        handleArtHide={this.handleArtHide}
                        zones={ this.state.zones }
                        countries={ this.state.countries }
                        login={ this.state.login }
                      />
                    )}/>
                    <Route path="/control" render={(props) => (
                      <Control {...props} {...this.state}
                          alert = { this.addAlert }
                          login={ this.state.login }
                      />
                    )}/>
                    <Route path="/editor" render={(props) => (
                      <Models {...props}
                          alert = { this.addAlert } 
                      />
                    )}/>
                    <Route path="/mosh" component={ MoshTest } />
                    <Route path="/not-found" component={ NotFound } />
                    <Redirect from="/" exact to="login" />
                    <Redirect to="/not-found" />
                </Switch>
            </Content>
        </Container>
        <AlertPage alerts={ this.state.alerts } handleDelete={ this.deleteAlert }/>
      </div>
    );
  }

  async loadState () {
    let { data: sites } = await axios.get(`${gameServer}api/sites`); // Axios call to server for all sites
    let { data: teams } = await axios.get(`${gameServer}api/team`); // Axios call to server for all teams
    let { data: aircrafts } = await axios.get(`${gameServer}api/interceptor`); //Axios call to server for all teams
    let { data: articles } = await axios.get(`${gameServer}api/news/articles`); //Axios call to server for all articles
    let { data: zones } = await axios.get(`${gameServer}api/zones`) // Axios call to server for all zones
    let { data: facilities } = await axios.get(`${gameServer}api/facilities`) // Axios call to server for all facilities
    let { data: military } = await axios.get(`${gameServer}api/military`) // Axios call to server for all military
    let { data: countries } = await axios.get(`${gameServer}api/country`) // Axios call to server for all countries
    this.setState({ teams, sites, aircrafts, articles, zones, facilities, military, countries })
  }

  async getNews () {
    //let { data: bnc } = await axios.get(`${gameServer}api/news/bnc`);
    //let { data: gnn } = await axios.get(`${gameServer}api/news/gnn`);
    let { data: articles } = await axios.get(`${gameServer}api/news/articles`); //Axios call to server for all articles
    this.setState({ articles });
  }

  updateAccounts = async (team) => {
    console.log(`${team.name} Accounts update...`);
    let { data: accounts } = await axios.put(`${gameServer}api/banking/accounts`, { "team": team._id });
    this.addAlert({type: 'success', title: 'Accounts Update', body: `The accounts for ${this.state.team.name} have been updated...`})
    let accountIndex = accounts.findIndex(account => account.name === 'Treasury');
    let megabucks = 0;
    accountIndex < 0 ? megabucks = 0 : megabucks = accounts[accountIndex].balance;
    this.setState({ accounts, megabucks })
  }

  updateAircrafts = async () => {
    let { data: aircrafts } = await axios.get(`${gameServer}api/interceptor`);
    this.addAlert({type: 'success', title: 'Aircrafts Update', body: `The aircrafts for ${this.state.team.name} have been updated...`})
    this.setState({ aircrafts })
  }

  handleLogin = async () => {
    const jwt = localStorage.getItem('token');
    const user = jwtDecode(jwt);
    this.setState({ user, login: true })
    Alert.success(`${user.username} logged in...`);
    if (user.team) {
      this.addAlert({type: 'success', title: 'Team Login', body: `Logged in as ${user.team.name}...`})
      this.setState({ team: user.team });
      this.updateAccounts(this.state.team);
    }
    playTrack('login');
    clockSocket.emit('new user', { team: user.team.shortName, user: user.username });
    updateSocket.emit('new user', { team: user.team.shortName, user: user.username });
  }

  handleSignout = () => {
    this.setState({ team: null })
  }

  deleteAlert = alertId => {
    const alerts = this.state.alerts.filter(a => a.id !== alertId);
    this.setState({ alerts });
  };

  addAlert = async (alert) => {
    let alerts = this.state.alerts
    console.log(`ID: ${idCount}`)
    alert.id = idCount++;;
    alerts.push(alert);
    setTimeout(() => this.deleteAlert(alert.id), 5000)
    this.setState({ alerts });
  };

  handleArtHide = (article) => {
    let articles = this.state.articles;
    Alert.warning(`Hiding ${article.articleBody} article...`);

    /*if(article.agency === 'BNC') {
        console.log(article.agency);
        index = artBnc.indexOf(article._id);
        artBnc.splice(index,1);
    }
    else if(article.agency === 'GNN') {
        artGnn.splice(artGnn.indexOf(article._id),1);
    }
    else {
        artPr.splice(artPr.indexOf(article._id),1);
    }*/

    //let news = {}
    articles.splice(articles.indexOf(article._id),1);

    this.setState({articles});
  }
}

// Defines the side/panel taggle navigation
const NavToggle = ({ login, expand, onChange, signOut }) => {
  return (
    <Navbar appearance="subtle" className="nav-toggle">
      <Navbar.Body>
        <Nav>
          <Dropdown
            placement="topStart"
            trigger="click"
            renderTitle={children => {
              return <Icon style={iconStyles} icon="cog" />;
            }}
          >
            <Dropdown.Item to="/404" componentClass={NavLink}>Profile</Dropdown.Item>
            <Dropdown.Item to="/404" componentClass={NavLink}>Settings</Dropdown.Item>
            <Dropdown.Item to="/control" componentClass={NavLink}>Control</Dropdown.Item>
            { login && (<React.Fragment>
              <Dropdown.Item to="/" onClick={signOut} componentClass={NavLink}>Sign out</Dropdown.Item>
            </React.Fragment>)}
          </Dropdown>
        </Nav>
        <Nav pullRight>
          <Nav.Item onClick={onChange} style={{ width: 56, textAlign: 'center' }}>
            <Icon icon={expand ? 'angle-left' : 'angle-right'} />
          </Nav.Item>
        </Nav>
      </Navbar.Body>
    </Navbar>
  );
};

export default App