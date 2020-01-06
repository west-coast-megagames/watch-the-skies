import React, { Component } from "react";
import { Sidenav, Navbar, Sidebar, Container, Dropdown, Icon, Nav } from 'rsuite';
import { Route, Switch, Redirect, NavLink } from 'react-router-dom';

// Pages
import Governance from './governance';
import LoginForm from '../components/loginForm'
import Interception from './interceptions'
import Home from './home'
import Control from './control';
import NotFound from './404'
import MoshTest from './mosh' // Mosh test

const headerStyles = {
    padding: 18,
    fontSize: 16,
    height: 56,
    background: '#34c3ff',
    color: ' #fff',
    whiteSpace: 'nowrap',
    overflow: 'hidden'
  };
  
  const iconStyles = {
    width: 56,
    height: 56,
    lineHeight: '56px',
    textAlign: 'center'
  };
  
  const NavToggle = ({ expand, onChange }) => {
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
              <Dropdown.Item>Help</Dropdown.Item>
              <Dropdown.Item>Settings</Dropdown.Item>
              <Dropdown.Item>Sign out</Dropdown.Item>
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
  
  class ContentArea extends Component {
    constructor(props) {
      super(props);
      this.state = {
        expand: true,
        active: '1'
      };
      this.handleSelect = this.handleSelect.bind(this);
      this.handleToggle = this.handleToggle.bind(this);
    }
    handleToggle() {
      this.setState({
        expand: !this.state.expand
      });
    }

    handleSelect(activeKey) {
      this.setState({ active: activeKey });
    }

    setKey(key) {
      this.setState({ active: key })
    }

    render() {
      const { expand } = this.state;
      const { active } = this.state;
      return (
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
                  <Nav >
                    <NavLink to="/budget" >
                      <Nav.Item eventKey="1" icon={<Icon icon="bank" />}>
                        Governance
                      </Nav.Item>
                    </NavLink>
                    <NavLink to="/interceptions">
                      <Nav.Item eventKey="2" to="/interceptions" icon={<Icon icon="globe2" />}>
                        Operations
                      </Nav.Item>
                    </NavLink>
                    <Nav.Item eventKey="3" icon={<Icon icon="flask" />}>
                      Science
                    </Nav.Item>
                    <Nav.Item eventKey="4" icon={<Icon icon="handshake-o" />}>
                      Diplomacy
                    </Nav.Item>
                    <Nav.Item eventKey="5" icon={<Icon icon="comments" />}>
                      Comms
                    </Nav.Item>
                    <Nav.Item eventKey="6" icon={<Icon icon="newspaper-o" />}>
                      News
                    </Nav.Item>
                    <Nav.Item eventKey="7" icon={<Icon icon="info-circle" />}>
                      Info
                    </Nav.Item>
                  </Nav>
                </Sidenav.Body>
              </Sidenav>
              <NavToggle expand={expand} onChange={this.handleToggle} />
            </Sidebar>
            <Container>
                <Switch>
                    <Route path="/login" component={ LoginForm } />
                    <Route path="/home" render={() => (
                    <Home
                        login={ this.props.login }
                        teams={ this.props.teams }
                        onChange={ this.props.handleLogin }
                    />
                    )} />
                    <Route path="/interceptions" render={() => (
                    <Interception 
                        team={ this.props.team }
                        aircrafts={ this.props.aircrafts }
                        alert={ this.props.addAlert } 
                    /> 
                    )} />
                    <Route path="/budget" render={() => (
                    <Governance 
                        team = { this.props.team }
                        accounts = { this.props.accounts }
                        handleUpdate = { this.updateAccounts }
                    />
                    )}/>
                    <Route path="/mosh" component={ MoshTest } />
                    <Route path="/control" render={() => (
                    <Control
                        alert = { this.props.addAlert } 
                    />
                    )}/>
                    <Route path="/not-found" component={ NotFound } />
                    <Redirect from="/" exact to="home" />
                    <Redirect to="/not-found" />
                </Switch>
            </Container>
        </Container>
        );
    }
}
      

export default ContentArea;