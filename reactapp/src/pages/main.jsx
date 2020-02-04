import React, { Component } from "react";
import { Sidenav, Navbar, Sidebar, Container, Dropdown, Icon, Nav, Content } from 'rsuite';
import { Route, Switch, Redirect, NavLink } from 'react-router-dom';

// Pages
import Governance from './governance';
import Home from './home';
import Control from './control';
import NotFound from './404';
import MoshTest from './mosh'; // Mosh test
import Operations from "./operations";
import Science from './science';
import Diplomacy from './diplomacy';
import Chat from './chat';
import News from './news';
import Registration from './../components/registration';

  const iconStyles = {
    width: 56,
    height: 56,
    lineHeight: '56px',
    textAlign: 'center'
  };
  
  const NavToggle = ({ login, expand, onChange }) => {
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
                <Dropdown.Item to="/404" componentClass={NavLink}>Sign out</Dropdown.Item>
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
                  <Nav>
                    <Nav.Item eventKey="1" to="/gov" componentClass={NavLink} icon={<Icon icon="bank" />}>Governance</Nav.Item>
                    <Nav.Item eventKey="2" to="/ops" componentClass={NavLink} icon={<Icon icon="globe2" />}>Operations</Nav.Item>
                    <Nav.Item eventKey="3" to="/sci" componentClass={NavLink} icon={<Icon icon="flask" />}>Science</Nav.Item>
                    <Nav.Item eventKey="4" to="/dip" componentClass={NavLink} icon={<Icon icon="handshake-o" />}>Diplomacy</Nav.Item>
                    <Nav.Item eventKey="5" to="/comms" componentClass={NavLink} icon={<Icon icon="comments" />}>Comms</Nav.Item>
                    <Nav.Item eventKey="6" to="/news" componentClass={NavLink} icon={<Icon icon="newspaper-o" />}>News</Nav.Item>
                    <Nav.Item eventKey="7" to="/home" componentClass={NavLink} icon={<Icon icon="info-circle" />}>Info</Nav.Item>
                  </Nav>
                </Sidenav.Body>
              </Sidenav>
              <NavToggle login={this.props.login} expand={expand} onChange={this.handleToggle} />
            </Sidebar>
            <Content>
                <Switch>
                    <Route path="/login" render={(props) => (
                      <Registration {...props}
                        addAlert={ this.props.addAlert }
                        handleLogin={ this.props.handleLogin }
                      />
                    )}/>
                    <Route path="/home" render={(props) => (
                      <Home {...props}
                          login={ this.props.login }
                          teams={ this.props.teams }
                          onChange={ this.props.handleLogin }
                      />
                    )} />
                    <Route path="/ops" render={(props) => (
                      <Operations {...props}
                        team={ this.props.team }
                        aircrafts={ this.props.aircrafts }
                        alert={ this.props.addAlert } 
                      />
                    )} />
                    <Route path="/gov" render={(props) => (
                      <Governance {...props}
                          team = { this.props.team }
                          accounts = { this.props.accounts }
                          handleUpdate = { this.updateAccounts }
                          alert={ this.props.addAlert }
                          
                      />
                    )}/>
                    <Route path="/sci" render={(props) => (
                      <Science {...props}
                          team = { this.props.team }
                          alert={ this.props.addAlert }
                      />
                    )}/>
                    <Route path="/dip" render={(props) => (
                      <Diplomacy {...props}
                          team = { this.props.team }
                          alert={ this.props.addAlert }
                      />
                    )}/>
                    <Route path="/comms" render={(props) => (
                      <Chat {...props}
                        team = { this.props.team }
                        alert={ this.props.addAlert }
                      />
                    )}/>
                    <Route path="/news" render={(props) => (
                      <News {...props}
                        articles={ this.props.articles }
                        alert={ this.props.addAlert }
                        teams={this.props.teams}
                        handleArtHide={this.props.handleArtHide}
                      />
                    )}/>
                    <Route path="/control" render={(props) => (
                      <Control {...props}
                          alert = { this.props.addAlert } 
                      />
                    )}/>
                    <Route path="/mosh" component={ MoshTest } />
                    <Route path="/not-found" component={ NotFound } />
                    <Redirect from="/" exact to="login" />
                    <Redirect to="/not-found" />
                </Switch>
            </Content>
        </Container>
        );
    }
}
      

export default ContentArea;