import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import NavBar from './components/navBar';
import Interception from './pages/interceptions'
import Budget from './pages/budget'
import Home from './pages/home'
import NotFound from './pages/404'
import LoginForm from './components/loginForm'

import MoshTest from './pages/mosh' // Mosh test

import './App.css';

import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.css';
import 'react-rangeslider/lib/index.css'


function App() {
  return (
    <div className="App">
      <NavBar />
      <main>
      <Switch>
        <Route path="/login" component={ LoginForm }></Route>
        <Route path="/home" component={ Home } />
        <Route path="/interceptions" component={ Interception } />
        <Route path="/budget" component={ Budget } />
        <Route path="/mosh" component={ MoshTest } />
        <Route path="/not-found" component={ NotFound } />
        <Redirect from="/" exact to="home" />
        <Redirect to="/not-found" />
      </Switch>
      </main>
    </div>
  );
}

export default App;
