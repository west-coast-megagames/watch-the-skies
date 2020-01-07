import React, { Component } from 'react'; // React import
import { Nav, Container, Header, Content, Icon } from 'rsuite';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlask, faAtom, faVials, faTools } from '@fortawesome/free-solid-svg-icons'

class Science extends Component {
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
                    <Nav.Item eventKey="research" icon={<FontAwesomeIcon icon={faFlask} />}> Research</Nav.Item>
                    <Nav.Item eventKey="knowledge" icon={<FontAwesomeIcon icon={faAtom} />}> Scientific Knowledge</Nav.Item>
                    <Nav.Item eventKey="applied" icon={<FontAwesomeIcon icon={faVials} />}> Applied Tech</Nav.Item>
                    <Nav.Item eventKey="salvage" icon={<FontAwesomeIcon icon={faTools} />}> Salvage</Nav.Item>
                </Nav>
            </Header>
            <Content style={{ paddingLeft: 20 }}>
                <Container className="dashboard" hidden={ this.getActive('dashboard')} >
                    <h5>No dashboard has been coded for the Science Module!</h5>
                </Container>
                <Container className="research" hidden={ this.getActive('research') }>
                    <h5>The research system for the Science Module has not been created!</h5>
                </Container>
                <Container className="knowledge" hidden={ this.getActive('knowledge') }>
                    <h5>The knowledge system for the Science Module has not been created!</h5>
                </Container>
                <Container className="applied" hidden={ this.getActive('applied') }>
                    <h5>The applied technology system for the Science Module has not been created!</h5>
                </Container>
                <Container className="salvage" hidden={ this.getActive('salvage') }>
                    <h5>The salvage system for the Science Module has not been created!</h5>
                </Container>
            </Content>
        </Container>
         );
     }
 }

export default Science;