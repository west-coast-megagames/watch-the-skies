import React, { Component } from 'react'; // React imports
import { Header, Container, Content } from 'rsuite'; // rsuite components
import { Route, Switch, Redirect } from 'react-router-dom'; // React navigation components
import { updateEvents, gameClock } from './api' // Socket.io event triggers and actions

import { connect } from 'react-redux'; // Redux store provider
import notify from './scripts/notify';

// Components
import NavBar from './components/navBar';
import SideNav from './components/navigation/sidenav';
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

// React App Component
class App extends Component {
  state = {
    clock: {
      minutes: '00',
      seconds: '00',
      turn: null
    },
    accounts: [],
    megabucks: 0
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
      if(this.state.turn !== 'Test Turn' && this.state.turnNum !== clock.turnNum && this.props.team !== null) {
          updateEvents.updateTeam(this.props.team._id);
      }
      this.setState({clock})
    })
  }

  render() {
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
            {this.props.login ? <SideNav team={ this.props.team} /> : null}
            <Content>
                <Switch>
                    <Route path="/login" render={(props) => (
                      <Registration {...props}
                      />
                    )}/>
                    <Route path="/home" render={(props) => (
                      <Home {...props}
                        login={this.props.login}
                      />
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

const mapStateToProps = state => ({
  notifications: state.notifications.list.filter(el => el.hidden === false),
  team: state.auth.team,
  login: state.auth.login
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(App);