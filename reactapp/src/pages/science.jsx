import React, { Component } from 'react'; // React import
import { Nav, Container, Header, Content, Icon, Progress, Steps } from 'rsuite';
import { Route, Switch, NavLink, Redirect } from 'react-router-dom';
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
        const url = this.props.match.path;
        const { tab } = this.state; 

         return (
        <Container>
            <Header>
                <Nav appearance="tabs" activeKey={ tab } onSelect={this.handleSelect} style={{ marginBottom: 10 }}>
                    <Nav.Item eventKey="dashboard" to={`${url}/dashboard`} componentClass={NavLink} icon={<Icon icon="dashboard" />}>Dashboard</Nav.Item>
                    <Nav.Item eventKey="research" to={`${url}/research`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faFlask} />}> Research</Nav.Item>
                    <Nav.Item eventKey="knowledge" to={`${url}/knowledge`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faAtom} />}> Scientific Knowledge</Nav.Item>
                    <Nav.Item eventKey="applied" to={`${url}/applied`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faVials} />}> Applied Tech</Nav.Item>
                    <Nav.Item eventKey="salvage" to={`${url}/salvage`} componentClass={NavLink}icon={<FontAwesomeIcon icon={faTools} />}> Salvage</Nav.Item>
                </Nav>
            </Header>
            <Content style={{ paddingLeft: 20 }}>
                <Switch>
                    <Route path={`${url}/dashboard`} render={() => (
                        <h5>No dashboard has been coded for the Science Module!</h5>
                    )}/>
                    <Route path={`${url}/research`}  render={() => (
                        <React.Fragment><h5>Active focus: Computer Science I</h5><Progress.Line percent={25} status='active' /></React.Fragment>
                    )}/>
                    <Route path={`${url}/knowledge`} render={() => (
                        <div>
                            <h5>Astrophysics</h5>
                            <Steps current={0} small>
                                <Steps.Item title="Researching..." />
                                <Steps.Item title="Unavailible" />
                                <Steps.Item title="Unavailible" />
                                <Steps.Item title="Unavailible" />
                                <Steps.Item title="Unavailible" />
                            </Steps>
                            <hr />
                            <h5>Biology</h5>
                            <Steps current={0} small>
                                <Steps.Item title="Researching..." />
                                <Steps.Item title="Unavailible" />
                                <Steps.Item title="Unavailible" />
                                <Steps.Item title="Unavailible" />
                                <Steps.Item title="Unavailible" />
                            </Steps>
                            <hr />
                            <p>Computer Science</p>
                            <Steps current={1} small>
                                <Steps.Item title="Published" />
                                <Steps.Item title="Researching..." />
                                <Steps.Item title="Unavailible" />
                                <Steps.Item title="Unavailible" />
                                <Steps.Item title="Unavailible" />
                            </Steps>
                            <hr />
                            <p>Electronics</p>
                            <Steps current={1} small>
                                <Steps.Item title="Published." />
                                <Steps.Item title="Researching.." />
                                <Steps.Item title="Unavailible" />
                                <Steps.Item title="Unavailible" />
                                <Steps.Item title="Unavailible" />
                            </Steps>
                            <hr />
                            <p>Engineering</p>
                            <Steps current={2} small>
                                <Steps.Item title="Published" />
                                <Steps.Item title="Published" />
                                <Steps.Item title="Researching..." />
                                <Steps.Item title="Unavailible" />
                                <Steps.Item title="Unavailible" />
                            </Steps>
                            <hr />
                            <p>Genetics</p>
                            <Steps current={1} small>
                                <Steps.Item title="Published." />
                                <Steps.Item title="Researching.." />
                                <Steps.Item title="Unavailible" />
                                <Steps.Item title="Unavailible" />
                                <Steps.Item title="Unavailible" />
                            </Steps>
                            <hr />
                            <p>Material Science</p>
                            <Steps current={0} small>
                                <Steps.Item title="Published." />
                                <Steps.Item title="Researching.." />
                                <Steps.Item title="Unavailible" />
                                <Steps.Item title="Unavailible" />
                                <Steps.Item title="Unavailible" />
                            </Steps>
                            <hr />
                            <p>Psychology</p>
                            <Steps current={3} small>
                                <Steps.Item title="Published." />
                                <Steps.Item title="Published" />
                                <Steps.Item title="Published" />
                                <Steps.Item title="Researching.." />
                                <Steps.Item title="Unavailible" />
                            </Steps>
                            <hr />
                            <p>Social Science</p>
                            <Steps current={1} small>
                                <Steps.Item title="Published." />
                                <Steps.Item title="Researching.." />
                                <Steps.Item title="Unavailible" />
                                <Steps.Item title="Unavailible" />
                                <Steps.Item title="Unavailible" />
                            </Steps>
                            <hr />
                            <p>Theoretical Physics</p>
                            <Steps current={0} small>
                                <Steps.Item title="Researching.." />
                                <Steps.Item title="Unavailible" />
                                <Steps.Item title="Unavailible" />
                                <Steps.Item title="Unavailible" />
                                <Steps.Item title="Unavailible" />
                            </Steps>
                        </div>
                    )}/>
                    <Route path={`${url}/applied`}  render={() => (
                        <h5>The applied technology system for the Science Module has not been created!</h5>
                    )}/>
                    <Route path={`${url}/salvage`}  render={() => (
                        <h5>The salvage system for the Science Module has not been created!</h5>
                    )}/>
                    <Redirect from={`${url}/`} exact to={`${url}/dashboard`} />
                </Switch>
            </Content>
        </Container>
         );
     }
 }

export default Science;