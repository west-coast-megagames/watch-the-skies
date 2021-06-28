import React, { Component } from 'react'; // React imports
import { connect } from 'react-redux'; // Redux store provider
import { Route, Switch, Redirect } from 'react-router-dom'; // React navigation components
import initUpdates from './scripts/initUpdates';

import { Header, Container, Content, Alert } from 'rsuite'; // rsuite components
import { updateEvents, gameClock } from './api' // Socket.io event triggers and actions
import socket from './socket';
import notify from './scripts/notify';

// Components
import NavBar from './components/navigation/navBar';
import SideNav from './components/navigation/sidenav';
import Registration from './components/registration';
import AlertPage from './components/common/alert';
import UserList from './components/common/userList';
import LoadingPage from './components/loading';

// Pages
import Governance from './pages/governance';
import Home from './pages/home';
import Control from './pages/control';
import NotFound from './pages/404';
import Operations from "./pages/operations";
import Science from './pages/science';
import Diplomacy from './pages/diplomacy';
import News from './pages/news';
import InfoDrawer from './components/infoDrawer';
import MapPage from './pages/map';

// Cascading Style Sheets - App.js | Bootstrap | Fontawesome | rsuite
import 'bootstrap/dist/css/bootstrap.css'; //only used for global nav (black bar)
import 'font-awesome/css/font-awesome.css';
import 'rsuite/dist/styles/rsuite-default.css'; // Light theme for rsuite components
// import 'rsuite/dist/styles/rsuite-dark.css'; // Dark theme for rsuite components
import './App.css';
import { tokenLogin } from './store/entities/auth';

initUpdates()

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
		if (!this.props.login) {
			let token = localStorage.getItem('wtsLoginToken');
			if (token) {
				this.props.tokenLogin({ token });
			}
		}

    gameClock.subscribeToClock((err, clock) => {
      if (this.state.turn !== 'Test Turn' && this.state.turnNum !== clock.turnNum && this.props.team !== null) {
        updateEvents.updateTeam(this.props.team._id);
      }
      this.setState({clock})
    })


		socket.on('alert', data => {
			switch (data.type) {
				case ('error'):
					Alert.error(data.message, 6000);
					break;
				case ('success'):
					Alert.success(data.message, 6000);
					break;
				case ('warning'):
					Alert.warning(data.message, 6000);
					break;
				default:
					Alert.info(data.message, 6000);
			}
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
							<Route path="/map" render={(props) => (
								<MapPage {...props}
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
							<Route path="/not-found" component={ NotFound } />
							<Route path="/loading" component={ LoadingPage } />
							<Redirect from="/" exact to="home" />
							<Redirect to="/not-found" />
						</Switch>
					</Content>
        </Container>
        <InfoDrawer />
        <AlertPage alerts={ this.props.notifications } />
        <UserList />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  notifications: state.notifications.list.filter(el => el.hidden === false),
  team: state.auth.team,
  login: state.auth.login
});

const mapDispatchToProps = dispatch => ({
	tokenLogin: (data) => dispatch(tokenLogin(data))
});

export default connect(mapStateToProps, mapDispatchToProps)(App);