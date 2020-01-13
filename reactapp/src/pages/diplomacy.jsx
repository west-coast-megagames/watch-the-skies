import React, { Component } from 'react'; // React import
import { Nav, Container, Header, Content, Icon } from 'rsuite';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileContract, faHandsHelping, faUniversity, faUserTie } from '@fortawesome/free-solid-svg-icons'

class Diplomacy extends Component {
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
                    <Nav.Item eventKey="dashboard"  icon={<Icon icon="dashboard" />}>Dashboard</Nav.Item>
                    <Nav.Item eventKey="envoys" icon={<FontAwesomeIcon icon={faUserTie} />}> Envoys</Nav.Item>
                    <Nav.Item eventKey="trades" icon={<FontAwesomeIcon icon={faHandsHelping} />}> Trades</Nav.Item>
                    <Nav.Item eventKey="treaties" icon={<FontAwesomeIcon icon={faFileContract} />}> Treaties</Nav.Item>
                    <Nav.Item eventKey="united-nations" icon={<FontAwesomeIcon icon={faUniversity} />}> UN Security Council</Nav.Item>
                </Nav>
            </Header>
            <Content style={{ paddingLeft: 20 }}>
                <Container className="dashboard" hidden={ this.getActive('dashboard')} >
                    <h5>No dashboard has been coded for the Diplomacy Module!</h5>
                </Container>
                <Container className="envoys" hidden={ this.getActive('envoys') }>
                    <h5>The envoy system for the Diplomacy Module has not been created!</h5>
                </Container>
                <Container className="trades" hidden={ this.getActive('trades') }>
                    <h5>The envoy system for the Diplomacy Module has not been created!</h5>
                </Container>
                <Container className="treaties" hidden={ this.getActive('treaties') }>
                    <h5>The treaty system for the Diplomacy Module has not been created!</h5>
                </Container>

                <Container className="united-nations" hidden={ this.getActive('united-nations') }>
                    <h5>The United Nations system for the Diplomacy Module has not been created!</h5>
                </Container>
            </Content>
        </Container>
         );
     }
 }

export default Diplomacy;