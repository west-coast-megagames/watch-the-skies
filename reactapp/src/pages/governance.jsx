import React, { Component } from 'react'; // React import
import { Nav, Container, Header, Content, Icon } from 'rsuite';
import Budget from './budget';

class Governance extends Component {
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
                    <Nav.Item eventKey="budget" icon={<Icon icon="money" />}>Budget</Nav.Item>
                    <Nav.Item eventKey="espionage" icon={<Icon icon="user-secret" />}>Espionage</Nav.Item>
                    <Nav.Item eventKey="ratification" icon={<Icon icon="order-form" />}>Treaty Ratification</Nav.Item>
                </Nav>
            </Header>
            <Content style={{ paddingLeft: 20 }}>
                <Container className="dashboard" hidden={ this.getActive('dashboard')} >
                    <h5>No dashboard has been coded for the Governance Module!</h5>
                </Container>
                <div className="budget" hidden={ this.getActive('budget') }>
                    <Budget
                        team={ this.props.team }
                        accounts={ this.props.accounts }
                        handleUpdate={ this.props.handleUpdate }
                        alert={ this.props.alert }
                    />
                </div>
                <div className="espionage" hidden={ this.getActive('espionage') }>
                    <h5>The espionage system for the Governance Module has not been created!</h5>
                </div>
                <div className="ratification" hidden={ this.getActive('ratification') }>
                    <h5>The treaty system for the Governance Module has not been created!</h5>
                </div>
            </Content>
        </Container>
         );
     }
 }

export default Governance;