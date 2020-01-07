import React, { Component } from 'react'; // React import
import { Nav, Container, Header, Content, Icon } from 'rsuite';
import Interception from './tabs/interceptions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faRadiation, faGlobe, faFighterJet } from '@fortawesome/free-solid-svg-icons'

class Operations extends Component {
    constructor() {
        super();
        this.state = {
          tab: 'dashboard'
        };
        this.handleSelect = this.handleSelect.bind(this);
    }

    getActive(element) {
        return element === this.state.tab ? '' : 'hidden'
    }

    handleSelect(activeKey) {
        this.setState({ tab: activeKey })
    }

    render() {
        const { tab } = this.state; 

         return (
        <Container>
            <Header>
                <Nav appearance="tabs" activeKey={ tab } onSelect={this.handleSelect} style={{ marginBottom: 10 }}>
                    <Nav.Item eventKey="dashboard"  icon={<FontAwesomeIcon icon={faShieldAlt} />}> Dashboard</Nav.Item>
                    <Nav.Item eventKey="interception" icon={<FontAwesomeIcon icon={faFighterJet} />}> Interceptions</Nav.Item>
                    <Nav.Item eventKey="globe" icon={<FontAwesomeIcon icon={faGlobe} />}> Global</Nav.Item>
                    <Nav.Item eventKey="nuclear" icon={<FontAwesomeIcon icon={faRadiation} />}> Nuclear</Nav.Item>
                </Nav>
            </Header>
            <Content style={{ paddingLeft: 20 }}>
                <Container className="dashboard" hidden={ this.getActive('dashboard')} >
                    <h5>No dashboard has been coded for the Operations Module!</h5>
                </Container>
                <div className="interception" hidden={ this.getActive('interception') }>
                    <Interception 
                      team={ this.props.team }
                      aircrafts={ this.props.aircrafts }
                      alert={ this.props.alert } 
                    /> 
                </div>
                <div className="globe" hidden={ this.getActive('globe') }>
                    <h5>The global system for the Operations Module has not been created!</h5>
                </div>
                <div className="nuclear" hidden={ this.getActive('nuclear') }>
                    <h5>The nuclear system for the Operations Module has not been created!</h5>
                </div>
            </Content>
        </Container>
         );
     }
 }

export default Operations;