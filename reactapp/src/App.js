import React, { Component } from 'react'; // React
import { Route, Switch, Redirect } from 'react-router-dom';
import { teamEvents, currentAircrafts, updateAccounts } from './api'
import axios from 'axios';

// Components
import NavBar from './components/navBar';
import Toast from './components/toast'

// Pages
import LoginForm from './components/loginForm'
import Interception from './pages/interceptions'
import Budget from './pages/budget'
import Home from './pages/home'
import Control from './pages/control';
import NotFound from './pages/404'
import MoshTest from './pages/mosh' // Mosh test

// Cascading Style Sheets - App.js | Bootstrap | Fontawesome
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.css';
import 'rsuite/dist/styles/rsuite-default.css'

import AlertPage from './components/common/alert';

let idCount = 0;

// React App Component
class App extends Component {
  // Main App state
  state = {
    login: false,
    user: {},
    teams: [],
    aircrafts: [],
    accounts: [],
    megabucks: 0,
    team: {
      name: "Select Team"
    },
    alerts: []
  }

  componentDidMount() {
    this.getTeams(); //Get all teams in DB and store to state
    teamEvents.teamUpdate((err, team) => {
      if(this.state.team.name !== "Select Team") {
        this.setState({ team });
      }
    });

    currentAircrafts((err, aircrafts) => {
      console.log('Reciving aircrafts...')
      this.setState({ aircrafts })
    });

    updateAccounts((err, accounts) => {
      accounts = accounts.filter(a => a.team.team_id === this.state.team._id);
      let accountIndex = accounts.findIndex(account => account.name === 'Treasury');
      let megabucks = 0;
      accountIndex < 0 ? megabucks = 0 : megabucks = accounts[accountIndex].balance;
      this.setState({ accounts, megabucks })
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.team !== this.state.team && this.state.team.name !== 'Updating...') {
        this.updateAccounts(this.state.team);
    }
  }

    // Axios call to server for all teams
    async getTeams () {
      let { data: teams } = await axios.get('http://localhost:5000/api/team');
      this.setState({ teams })
    }
  
    updateTeam = async (team) => {
      if (team.id !== undefined) {
        console.log(`${team.name} Updating...`);
        teamEvents.updateTeam(team._id);
      };
    };
  
    updateAccounts = async (team) => {
      console.log(`${team.name} Accounts update...`);
      let { data: accounts } = await axios.put('http://localhost:5000/api/banking/accounts', { "team_id": team._id });
      this.addAlert({type: 'success', title: 'Accounts Update', body: `The accounts for ${this.state.team.name} have been updated...`})
      let accountIndex = accounts.findIndex(account => account.name === 'Treasury');
      let megabucks = 0;
      accountIndex < 0 ? megabucks = 0 : megabucks = accounts[accountIndex].balance;
      this.setState({ accounts, megabucks })
    }
  
    updateAircrafts = async () => {
      let { data: aircrafts } = await axios.get('http://localhost:5000/api/interceptor');
      this.addAlert({type: 'success', title: 'Aircrafts Update', body: `The aircrafts for ${this.state.team.name} have been updated...`})
      this.setState({ aircrafts })
    }
  
    handleLogin = async (team) => {
      console.log(`${team.name} login Submitted`);
      this.setState({ login: true, team: { name: "Updating..."} })
      this.addAlert({type: 'success', title: 'Team Login', body: `Logged in as ${team.name}...`})
      teamEvents.updateTeam(team._id)
      this.updateAircrafts();
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

  render() {
    return(
      <div className="App">
        <NavBar 
          team={ this.state.team }
          megabucks={ this.state.megabucks }
        />
          <main>
              <Switch>
                <Route path="/login" component={ LoginForm } />
                <Route path="/home" render={() => (
                  <Home
                    login={ this.state.login }
                    teams={ this.state.teams }
                    onChange={ this.handleLogin }
                  />
                )} />
                <Route path="/interceptions" render={() => (
                  <Interception 
                    team={ this.state.team }
                    aircrafts={ this.state.aircrafts }
                    alert={ this.addAlert } 
                  /> 
                )} />
                <Route path="/budget" render={() => (
                  <Budget 
                    team = { this.state.team }
                    accounts = { this.state.accounts }
                    handleUpdate = { this.updateAccounts }
                  />
                )}/>
                <Route path="/mosh" component={ MoshTest } />
                <Route path="/control" render={() => (
                  <Control
                    alert = { this.addAlert } 
                  />
                )}/>
                <Route path="/not-found" component={ NotFound } />
                <Redirect from="/" exact to="home" />
                <Redirect to="/not-found" />
              </Switch>
              <AlertPage alerts={ this.state.alerts } handleDelete={ this.deleteAlert }/>
              <Toast />
          </main>
        </div>
    );
  }
}

export default App