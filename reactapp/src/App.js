import React, { Component } from 'react'; // React
import { teamEvents, currentAircrafts, updateAccounts } from './api'
import { Container, Header } from 'rsuite';
import axios from 'axios';

// Components
import NavBar from './components/navBar';
import ContentArea from './pages/main';
import Toast from './components/toast'

// Cascading Style Sheets - App.js | Bootstrap | Fontawesome | rsuite
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.css';
import 'rsuite/dist/styles/rsuite-default.css'
//import 'rsuite/dist/styles/rsuite-dark.css'

import AlertPage from './components/common/alert';


let idCount = 0;
let gameServer = 'http://localhost:5000';

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
    alerts: [],
    news: {
      bnc: [],
      gnn: []
    }
  }

  componentDidMount() {
    this.getTeams(); //Get all teams in DB and store to state
    this.getNews(); //Get all news in DB and store to state
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
      let { data: teams } = await axios.get(`${gameServer}/api/team`);
      this.setState({ teams })
    }

    async getNews () {
      let { data: bnc } = await axios.get(`${gameServer}/api/news/bnc`);
      let { data: gnn } = await axios.get(`${gameServer}/api/news/gnn`);
      let news = {
        bnc,
        gnn
      }
      this.setState({ news })
    }
  
    updateTeam = async (team) => {
      if (team.id !== undefined) {
        console.log(`${team.name} Updating...`);
        teamEvents.updateTeam(team._id);
      };
    };
  
    updateAccounts = async (team) => {
      console.log(`${team.name} Accounts update...`);
      let { data: accounts } = await axios.put(`${gameServer}/api/banking/accounts`, { "team_id": team._id });
      this.addAlert({type: 'success', title: 'Accounts Update', body: `The accounts for ${this.state.team.name} have been updated...`})
      let accountIndex = accounts.findIndex(account => account.name === 'Treasury');
      let megabucks = 0;
      accountIndex < 0 ? megabucks = 0 : megabucks = accounts[accountIndex].balance;
      this.setState({ accounts, megabucks })
    }
  
    updateAircrafts = async () => {
      let { data: aircrafts } = await axios.get(`${gameServer}/api/interceptor`);
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
        <Container className="App" style={{ position: 'fixed', top: 0, bottom: 0, width: '100%' }}>
          <Header>
            <NavBar 
              team={ this.state.team }
              megabucks={ this.state.megabucks }
            />
          </Header>
          <ContentArea
            login={ this.state.login }
            teams={ this.state.teams }
            team={ this.state.team }
            news={ this.state.news }
            accounts={ this.state.accounts }
            handleUpdate={ this.updateAccounts }
            aircrafts={ this.state.aircrafts }
            addAlert={ this.addAlert }
            handleLogin={ this.handleLogin }
            updateAccounts={ this.updateAccounts }
          />
          <AlertPage alerts={ this.state.alerts } handleDelete={ this.deleteAlert }/>
          <Toast />
        </Container>
    );
  }
}

export default App