import React, { Component } from 'react'; // React import - used for react rendering
import { connect } from 'react-redux'; // Redux store provider
import { Route, Switch, NavLink, Redirect } from 'react-router-dom'; // React router for URL links
import { gameServer } from '../config'; // Used for the current server URL.
import axios from 'axios'; // Axios import - used for HTTP calls
import { updateEvents } from '../api' // Socket.IO commands - used for socket communication with server

// Science Tabs
import Labs from '../pages/tabs/sci/labs';
import Knowledge from '../pages/tabs/sci/knowledge';
import Salvage from '../pages/tabs/sci/salvage';
import ResearchLabs from './tabs/sci/researchLabs';
import TechList from './tabs/sci/techList';

// Components
import { Nav, Container, Header, Content, Icon, Alert, Sidebar, Button } from 'rsuite'; // rsuite common components
import LoginLink from '../components/common/loginLink';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Font Awesome Icon
import { faFlask, faAtom, faMicrochip } from '@fortawesome/free-solid-svg-icons' // Font awesome symbols
import { getSciAccount } from '../store/entities/accounts';

class Science extends Component {
    constructor(props) {
        super(props);
        this.state = {
          tab: 'dashboard',
          fundingCost: [],
          techCost: []
        };
        this.handleSelect = this.handleSelect.bind(this);
        this.loadScience = this.loadScience.bind(this);
    }

    componentDidMount() {
        this.loadScience();
    }

    async loadScience() {
        const { data } = await axios.get(`${gameServer}game/research/sciState`);
        let techCost = data.techCost;
        let fundingCost = data.fundingCost;
        this.setState({ techCost, fundingCost, research: this.props.research });
    }

    getActive(element) {
        return element === this.state.tab ? '' : 'hidden'
    }

    handleSelect(activeKey) {
        this.setState({ tab: activeKey })
    }

    removeDuplicates(myArr, prop) {
        return myArr.filter((obj, pos, arr) => {
            return arr.map(mapObj => mapObj.name).indexOf(obj[prop]) === pos;
        });
      }
      
    render() {
        if (!this.props.login) this.props.history.push('/');
        const url = this.props.match.path;
        const { tab } = this.state;
        

        return (
        <Container>
            <Header>
                <Nav appearance="tabs" activeKey={ tab } onSelect={this.handleSelect} style={{ marginBottom: 10, zIndex: 999 }}>
                    <Nav.Item eventKey="dashboard" to={`${url}/dashboard`} componentClass={NavLink} icon={<Icon icon="dashboard" />}>Dashboard</Nav.Item>
                    <Nav.Item eventKey="Research Labs" to={`${url}/Research Labs`} componentClass={NavLink}icon={<FontAwesomeIcon icon={faFlask} />}> Research Labs</Nav.Item>
                    <Nav.Item eventKey="Knowledge" to={`${url}/Knowledge`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faAtom} />}> Scientific Knowledge</Nav.Item>
                    <Nav.Item eventKey="Tech List" to={`${url}/Tech List`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faMicrochip} />}> Tech List</Nav.Item>
                    {/* <Nav.Item eventKey="salvage" to={`${url}/salvage`} componentClass={NavLink}icon={<FontAwesomeIcon icon={faTools faVials} />}> Salvage</Nav.Item> */}
                </Nav>
            </Header>
            <Container>
            <Content className='tabContent' style={{ paddingLeft: 20 }}>
                <Switch>
                    <Route path={`${url}/dashboard`} render={() => (
                        <h5>No dashboard has been coded for the Science Module!</h5>
                    )}/>
                    <Route path={`${url}/research`}  render={() => (
                        <Labs    
                            team={ this.props.team }
                            allResearch={this.state.research}
                        />
                    )}/>
                    <Route path={`${url}/salvage`} render={() => (
                        <Salvage    
                            team={ this.props.team }
                            allResearch={this.state.research}
                        />
                    )}/>
                    <Route path={`${url}/Research Labs`} render={() => (
                        <ResearchLabs 
                            techCost={this.state.techCost}
                            fundingCost={this.state.fundingCost}
                        />
                    )}/>
                    <Route path={`${url}/Knowledge`} render={() => (
                        <Knowledge    
                            techCost={this.state.techCost}
                            
                        />
                    )}/>
                    <Route path={`${url}/Tech List`}  render={() => (
                        <TechList    
                            techCost={this.state.techCost}
                        />
                    )}/>
                    <Redirect from={`${url}/`} exact to={`${url}/dashboard`} />
                </Switch>
            </Content>
            <Sidebar>
                <Button block onClick={() => Alert.warning('Surpise! Yet another placeholder...', 4000)}>Rawr</Button>
            </Sidebar>
            </Container>
        </Container>
        );
    }
}

const mapStateToProps = state => ({
    login: state.auth.login,
    team: state.auth.team,
    account: getSciAccount(state)
});
  
  const mapDispatchToProps = dispatch => ({});
  
export default connect(mapStateToProps, mapDispatchToProps)(Science);
