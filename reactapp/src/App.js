import React, { Component } from 'react'; // React
import { Route, Switch, Redirect } from 'react-router-dom';
import { teamEvents, updateAircrafts, currentAircrafts } from './api'
import axios from 'axios';

// Components
import NavBar from './components/navBar';
import Toast from './components/toast'

// Pages
import LoginForm from './components/loginForm'
import Interception from './pages/interceptions'
import Budget from './pages/budget'
import Home from './pages/home'
import NotFound from './pages/404'
import MoshTest from './pages/mosh' // Mosh test

// Cascading Style Sheets - App.js | Bootstrap | Fontawesome
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.css';

// React App Component
class App extends Component {
  // Main App state
  state = {
    login: false,
    user: {},
    teams: [],
    aircrafts: [],
    team: {
      name: "Select Team",
      _id: "rawr"
    },
  }

  componentDidMount() {
    this.getTeams(); //Get all teams in DB and store to state
    teamEvents.teamUpdate((err, team) => {
      this.setState({ team });
    });

    currentAircrafts((err, aircrafts) => {
      console.log('Reciving aircrafts...')
      this.setState({ aircrafts })
    });
  }

  render() {
    return(
      <div className="App">
        <NavBar 
          team={ this.state.team }
          teams={ this.state.teams }
          onChange={ this.handleLogin }
        />
          <main>
          <Switch>
            <Route path="/login" component={ LoginForm } />
            <Route path="/home" component={ Home } />
            <Route path="/interceptions" render={() => (
              <Interception 
                team={ this.state.team }
                aircrafts={ this.state.aircrafts }
              /> 
            )} />
            <Route path="/budget" render={() => (
              <Budget 
                team = { this.state.team }
                handleUpdate = { this.getTeams }
              />
            )}/>
            <Route path="/mosh" component={ MoshTest } />
            <Route path="/not-found" component={ NotFound } />
            <Redirect from="/" exact to="home" />
            <Redirect to="/not-found" />
          </Switch>
          <Toast />
          </main>
        </div>
    );
  }

  // Axios call to server for all teams
  async getTeams () {
    let { data: teams } = await axios.get('http://localhost:5000/api/team');
    this.setState({ teams })
  }

  updateTeam = async (team) => {
    console.log(`${team.name} Updating...`);
    teamEvents.updateTeam(team._id)
  };

  handleLogin = async (team) => {
    console.log(`${team.name} login Submitted`);
    teamEvents.updateTeam(team._id)
    updateAircrafts();
  }
}

export default App