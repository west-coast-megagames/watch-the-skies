import React, { Component } from 'react';
import { connect } from 'react-redux'; // Redux store provider
import { Sidenav, Sidebar, Icon, Nav, Navbar, Dropdown, Whisper, Popover, Loader } from 'rsuite'; // rsuite components
import { NavLink } from 'react-router-dom'; // React navigation components
import ClockControls from '../clockControls';
import { signOut, } from '../../store/entities/auth';
import { getMyTeam } from '../../store/entities/teams';

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

		if (!this.props.loadComplete) {
			return(
				<Sidebar
					width={0}

				>
				</Sidebar>
			)
		}
		else {
			return (
				<Sidebar
					style={{ color: '#c0c0c0', display: 'flex', flexDirection: 'column', zIndex: 999,  borderRight: '3px solid', borderRadius: 0, borderColor: '#d4af37'  }}
					width={expand ? 200 : 56}
					collapsible
				>
					<Sidenav
					style={{ backgroundColor: 'inherit',  }}
						expanded={expand}
						defaultOpenKeys={['9']}
						appearance="subtle"
						activeKey={active}
						onSelect={this.handleSelect}
					>
						<Sidenav.Body>
							<Nav>
								<Nav.Item eventKey="1" to="/gov" componentClass={NavLink} icon={<Icon icon="bank" />}>Governance</Nav.Item>
								<Nav.Item eventKey="10" to="/map" componentClass={NavLink} icon={<Icon icon='map' />}>Map</Nav.Item>
								<Nav.Item eventKey="2" to="/ops" componentClass={NavLink} icon={<Icon icon="globe2" />}>Operations</Nav.Item>
								<Nav.Item eventKey="4" to="/dip" componentClass={NavLink} icon={<Icon icon="handshake-o" />}>Diplomacy</Nav.Item>
								<Nav.Item eventKey="6" to="/news" componentClass={NavLink} icon={<Icon icon="newspaper-o" />}>News</Nav.Item>
								<Nav.Item eventKey="7" to="/home" componentClass={NavLink} icon={<Icon icon="info-circle" />}>Info</Nav.Item>
								{(this.props.user.roles.some(el => el === 'Control') || this.props.team.type === 'Control') && <Whisper placement="right" trigger="click" speaker={clock}>
									<Nav.Item eventKey="8" icon={<Icon icon="clock-o"/>}>Game Clock</Nav.Item>
								</Whisper>}
								{(this.props.user.roles.some(el => el === 'Control') || this.props.team.type === 'Control') ? <Nav.Item eventKey="9" to="/control" componentClass={NavLink} icon={<Icon icon="ge" />}>Control</Nav.Item> : null}
								<Nav.Item  icon={<Icon icon="cog" />}>Settings

      		 		 </Nav.Item>
      		   		<Nav.Item icon={<Icon icon={expand ? 'angle-left' : 'angle-right'}/>} onClick={this.handleToggle}>
									{expand ? 'Minimize' : 'Expand'}
         			 </Nav.Item>
							</Nav>
						</Sidenav.Body>
					</Sidenav>
				</Sidebar>
			);			
		}

	}
}

							/* <Nav.Item eventKey="3" to="/sci" componentClass={NavLink} icon={<Icon icon="flask" />}>Science</Nav.Item> */

const mapStateToProps = state => ({
  login: state.auth.login,
	user: state.auth.user,
	// team: getMyTeam(state),
	loadComplete: state.auth.loadComplete
});

const mapDispatchToProps = dispatch => ({
	logoff: () => dispatch(signOut()),
});

export default connect(mapStateToProps, mapDispatchToProps)(SideNav);

// Defines the side/panel taggle navigation
const NavToggle = ({ login, expand, onChange, signOut }) => {
  return (
    <Navbar style={{ backgroundColor: 'inherit', borderRight: '3px solid', borderRadius: 0, borderColor: '#d4af37' }} appearance="subtle" className="nav-toggle">
      <Navbar.Body >
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
            { this.props.login && (<React.Fragment>
              <Dropdown.Item to="/" onClick={signOut} componentClass={NavLink}>Sign out</Dropdown.Item>
            </React.Fragment>)}
          </Dropdown>
        </Nav>
        <Nav pullRight>
          <Nav.Item onClick={this.handleToggle} style={{ width: 56, textAlign: 'center' }}>
						
            <Icon icon={expand ? 'angle-left' : 'angle-right'} />
          </Nav.Item>
        </Nav>
      </Navbar.Body>
    </Navbar>
  );
};

const clock = (
    <Popover title="Game Clock Controls">
      <ClockControls />
    </Popover>
)
