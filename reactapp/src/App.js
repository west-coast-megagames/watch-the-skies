import React, { Component } from 'react'; // React
import { teamEvents, currentAircrafts, updateAccounts } from './api'
import jwtDecode from 'jwt-decode'
import { Header } from 'rsuite';
import { gameServer } from './config';
import axios from 'axios';

// Components
import NavBar from './components/navBar';
import Registration from './components/registration';
import MainContainer from './pages/main';
import Toast from './components/toast'

// Cascading Style Sheets - App.js | Bootstrap | Fontawesome | rsuite
import 'bootstrap/dist/css/bootstrap.css'; //only used for global nav (black bar)
import 'font-awesome/css/font-awesome.css';
import 'rsuite/dist/styles/rsuite-default.css';
// import 'rsuite/dist/styles/rsuite-dark.css';
import './App.css';


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
    sites: [],
    accounts: [],
    megabucks: 0,
    team: null,
    alerts: [],
    articles: [],
    research: []
  }

  componentDidMount() {
    this.loadState(); //Get all teams, aircraft, sites, articles in DB and store to state
    // teamEvents.teamUpdate((err, team) => {
    //   if(this.state.team.name !== "Select Team") {
    //     this.setState({ team });
    //   }
    // });

    currentAircrafts((err, aircrafts) => {
      console.log('Reciving aircrafts...')
      this.setState({ aircrafts })
    });

    updateAccounts((err, accounts) => {
      accounts = accounts.filter(a => a.team === this.state.team._id);
      let accountIndex = accounts.findIndex(account => account.name === 'Treasury');
      let megabucks = 0;
      accountIndex < 0 ? megabucks = 0 : megabucks = accounts[accountIndex].balance;
      this.addAlert({type: 'success', title: 'Accounts Update', body: `The accounts for ${this.state.team.name} have been updated...`})
      this.setState({ accounts, megabucks })
    });
  }

  async loadState () {
    let { data: sites } = await axios.get(`${gameServer}api/sites`); // Axios call to server for all sites
    let { data: teams } = await axios.get(`${gameServer}api/team`); // Axios call to server for all teams
    let { data: aircrafts } = await axios.get(`${gameServer}api/interceptor`); //Axios call to server for all teams
    let { data: articles } = await axios.get(`${gameServer}api/news/articles`); //Axios call to server for all articles
    const {data: research} = await axios.get(`${gameServer}api/research`);  // Axios call to server for all research
    this.setState({ teams, sites, aircrafts, articles, research })
  }

  async getNews () {
    //let { data: bnc } = await axios.get(`${gameServer}api/news/bnc`);
    //let { data: gnn } = await axios.get(`${gameServer}api/news/gnn`);
    let { data: articles } = await axios.get(`${gameServer}api/news/articles`); //Axios call to server for all articles
    this.setState({ articles });
  }
  
  updateTeam = async (team) => {
    if (team.id !== undefined) {
      console.log(`${team.name} Updating...`);
      teamEvents.updateTeam(team._id);
    };
  };

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
    console.log(`${user.username} logged in...`);
    if (user.team) {
      this.addAlert({type: 'success', title: 'Team Login', body: `Logged in as ${user.team.name}...`})
      this.setState({ team: user.team });
      this.updateAccounts(this.state.team);
    }
    
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
    console.log('in hide');

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

  render() {
    if (this.state.team === null) {
      return(
        <Registration
        addAlert={ this.addAlert }
        handleLogin={ this.handleLogin }/>
      )
    }
    return(
        <div className="App" style={{ position: 'fixed', top: 0, bottom: 0, width: '100%' }}>
          <Header>
            <NavBar 
              team={ this.state.team }
              megabucks={ this.state.megabucks }
            />
          </Header>
          <MainContainer
            login={ this.state.login }
            user={ this.state.user }
            teams={ this.state.teams }
            team={ this.state.team }
            sites={ this.state.sites }
            articles={ this.state.articles }
            research={ this.state.research }
            accounts={ this.state.accounts }
            handleUpdate={ this.updateAccounts }
            aircrafts={ this.state.aircrafts }
            addAlert={ this.addAlert }
            handleLogin={ this.handleLogin }
            handleSignout={ this.handleSignout }
            updateAccounts={ this.updateAccounts }
            handleArtHide={this.handleArtHide}
          />
          <AlertPage alerts={ this.state.alerts } handleDelete={ this.deleteAlert }/>
          <Toast />
        </div>
    );
  }
}

export default App