import React, { Component } from 'react';
import { Sidenav, Sidebar, Icon, Nav, Navbar, Dropdown } from 'rsuite'; // rsuite components
import { NavLink } from 'react-router-dom'; // React navigation components

const iconStyles = { width: 56, height: 56, lineHeight: '56px', textAlign: 'center' };

class SideNav extends Component {
    state = {
        expand: false,
        active: null
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

    render() {
        const { expand, active } = this.state;
        return (
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
                  <Nav.Item eventKey="8" to="/mosh" componentClass={NavLink} icon={<Icon icon="info" />}>Mosh</Nav.Item>
                  {this.props.team !== null ? this.props.team.name === 'Control Team' && <Nav.Item eventKey="8" to="/control" componentClass={NavLink} icon={<Icon icon="ge" />}>Control</Nav.Item> : null}
                </Nav>
              </Sidenav.Body>
            </Sidenav>
            <NavToggle login={this.state.login} expand={expand} onChange={this.handleToggle} signOut={this.handleSignout} />
            </Sidebar>
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
 
export default SideNav;