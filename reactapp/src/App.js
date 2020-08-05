import React, { Component } from 'react'; // React imports
import { Header, Sidenav, Navbar, Sidebar, Container, Dropdown, Icon, Nav, Content } from 'rsuite'; // rsuite components
import { Route, Switch, Redirect, NavLink } from 'react-router-dom'; // React navigation components
import { updateEvents, gameClock } from './api' // Socket.io event triggers and actions

import { connect } from 'react-redux'; // Redux store provider
import notify from './scripts/notify';

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
import InfoDrawer from './components/infoDrawer';

// Cascading Style Sheets - App.js | Bootstrap | Fontawesome | rsuite
import 'bootstrap/dist/css/bootstrap.css'; //only used for global nav (black bar)
import 'font-awesome/css/font-awesome.css';
import 'rsuite/dist/styles/rsuite-default.css'; // Light theme for rsuite components
// import 'rsuite/dist/styles/rsuite-dark.css'; // Dark theme for rsuite components
import './App.css';



const iconStyles = { width: 56, height: 56, lineHeight: '56px', textAlign: 'center' };

// React App Component
class App extends Component {
  state = {
    clock: {
      minutes: '00',
      seconds: '00',
      turn: null
    },
    accounts: [],
    megabucks: 0,
    expand: false,
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
    // updateEvents.updateTeam((err, team) => {
    //   if(this.state.team.name !== "Select Team") {
    //     this.setState({ team });
    //   }
    // });

    // updateEvents.updateAircrafts((err, aircrafts) => {
    //   notify({type: 'success', title: 'Aircrafts Update', body: `The aircrafts for ${this.state.team.name} have been updated...`});
    //   this.setState({ aircrafts });
    // });

    // updateEvents.updateAccounts((err, accounts) => {
    //   accounts = accounts.filter(a => a.team === this.state.team._id);
    //   let accountIndex = accounts.findIndex(account => account.name === 'Treasury');
    //   let megabucks = 0;
    //   accountIndex < 0 ? megabucks = 0 : megabucks = accounts[accountIndex].balance;
    //   notify({type: 'success', title: 'Accounts Update', body: `The accounts for ${this.state.team.name} have been updated...`});
    //   this.setState({ accounts, megabucks });
    // });

    // updateEvents.updateMilitary((err, military) => {
    //   notify({type: 'success', title: 'Military Update', body: `The current state of military has been updated...`});
    //   this.setState({ military });
    // });

    // updateEvents.updateFacilities((err, facilities) => {
    //   notify({type: 'success', title: 'Facilities Update', body: `The current state facilities has been updated...`});
    //   this.setState({facilities})
    // });

    // updateEvents.addNews((err, article) => {
    //   notify({type: 'success', title: `News Published`, body: `${article.publisher.name} published ${article.headline}`});
    //   let articles = this.state.articles;
    //   articles.push(article);
    //   this.setState(articles);
    // })

    gameClock.subscribeToClock((err, clock) => {
      if(this.state.turn !== 'Test Turn' && this.state.turnNum !== clock.turnNum && this.state.team !== null) {
          updateEvents.updateTeam(this.props.team._id);
      }
      this.setState({clock})
    })
  }

  render() {
    const { expand, active } = this.state;

    return(
        <div className="App" style={{ position: 'fixed', top: 0, bottom: 0, width: '100%' }}>
          <Header>
            <NavBar
              clock={ this.state.clock }
              team={ this.props.team }
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
                  <Nav.Item eventKey="4" to="/dip" componentClass={NavLink} icon={<Icon icon="handshake-o" />}>Diplomacy</Nav.Item>
                  <Nav.Item eventKey="6" to="/news" componentClass={NavLink} icon={<Icon icon="newspaper-o" />}>News</Nav.Item>
                  <Nav.Item eventKey="7" to="/home" componentClass={NavLink} icon={<Icon icon="info-circle" />}>Info</Nav.Item>
                  {this.props.team !== null ? this.props.team.name === 'Control Team' && <Nav.Item eventKey="8" to="/control" componentClass={NavLink} icon={<Icon icon="ge" />}>Control</Nav.Item> : null}
                </Nav>
              </Sidenav.Body>
            </Sidenav>
            <NavToggle login={this.state.login} expand={expand} onChange={this.handleToggle} signOut={this.handleSignout} />
            </Sidebar>
            <Content>
                <Switch>
                    <Route path="/login" render={(props) => (
                      <Registration {...props}
                      />
                    )}/>
                    <Route path="/home" render={(props) => (
                      <Home {...props}/>
                    )}/>
                    <Route path="/ops" render={(props) => (
                      <Operations {...props}
                        accounts={ this.state.accounts }
                        alert={ notify }
                      />
                    )} />
                    <Route path="/gov" render={(props) => (
                      <Governance {...props}
                          accounts = { this.state.accounts }
                          alert={ notify }
                      />
                    )}/>
                    <Route path="/sci" render={(props) => (
                      <Science {...props}
                          accounts={ this.state.accounts }
                          alert={ notify }
                      />
                    )}/>
                    <Route path="/dip" render={(props) => (
                      <Diplomacy {...props}
                          accounts={ this.state.accounts }
                          alert={ notify }
                      />
                    )}/>
                    <Route path="/news" render={(props) => (
                      <News {...props} {...this.state}
                        alert={ notify }
                        handleArtHide={this.handleArtHide}
                      />
                    )}/>
                    <Route path="/control" render={(props) => (
                      <Control {...props} {...this.state}
                          alert = { notify }
                      />
                    )}/>
                    <Route path="/mosh" component={ MoshTest } />
                    <Route path="/not-found" component={ NotFound } />
                    <Redirect from="/" exact to="home" />
                    <Redirect to="/not-found" />
                </Switch>
            </Content>
        </Container>
        <InfoDrawer />
        <AlertPage alerts={ this.props.notifications } />
      </div>
    );
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

const mapStateToProps = state => ({
  notifications: state.notifications.list.filter(el => el.hidden === false),
  team: state.auth.team
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(App);