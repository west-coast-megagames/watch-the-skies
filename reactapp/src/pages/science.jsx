import React, { Component } from 'react'; // React import - used for react rendering
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
import { Nav, Container, Header, Content, Icon, Alert } from 'rsuite'; // rsuite common components
import LoginLink from '../components/common/loginLink';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Font Awesome Icon
import { faFlask, faAtom, faMicrochip } from '@fortawesome/free-solid-svg-icons' // Font awesome symbols

class Science extends Component {
    constructor() {
        super();
        this.state = {
          tab: 'dashboard',
          research : [],
          fundingCost: [],
          techCost: []
        };
        this.handleSelect = this.handleSelect.bind(this);
        this.loadScience = this.loadScience.bind(this);
    }

    componentDidMount() {
        this.loadScience();
        updateEvents.updateResearch((err, research) => {
            Alert.success('Research Update - The current state of research has been updated...')
            this.setState({ research });
          });
    }

    async loadScience() {
        const { data } = await axios.get(`${gameServer}api/research/sciState`);
        let { data: research } = await axios.get(`${gameServer}api/research`);  // Axios call to server for all research
        let techCost = data.techCost;
        let fundingCost = data.fundingCost;
        this.setState({ techCost, fundingCost, research });
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
        if (!this.props.login) return <LoginLink />
        const url = this.props.match.path;
        const { tab } = this.state; 
        

        return (
        <Container>
            <Header>
                <Nav appearance="tabs" activeKey={ tab } onSelect={this.handleSelect} style={{ marginBottom: 10 }}>
                    <Nav.Item eventKey="dashboard" to={`${url}/dashboard`} componentClass={NavLink} icon={<Icon icon="dashboard" />}>Dashboard</Nav.Item>
                    <Nav.Item eventKey="Research Labs" to={`${url}/Research Labs`} componentClass={NavLink}icon={<FontAwesomeIcon icon={faFlask} />}> Research Labs</Nav.Item>
                    <Nav.Item eventKey="Knowledge" to={`${url}/Knowledge`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faAtom} />}> Scientific Knowledge</Nav.Item>
                    <Nav.Item eventKey="Tech List" to={`${url}/Tech List`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faMicrochip} />}> Tech List</Nav.Item>
                    {/* <Nav.Item eventKey="salvage" to={`${url}/salvage`} componentClass={NavLink}icon={<FontAwesomeIcon icon={faTools faVials} />}> Salvage</Nav.Item> */}
                </Nav>
            </Header>
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
                            allResearch={this.state.research}
                            facilities={this.props.facilities}
                            team={this.props.team}
                            techCost={this.state.techCost}
                            fundingCost={this.state.fundingCost}
                            accounts={this.props.accounts}
                        />
                    )}/>
                    <Route path={`${url}/Knowledge`} render={() => (
                        <Knowledge    
                            team={ this.props.team }
                            allResearch={this.state.research}
                            facilities={this.props.facilities}
                            accounts={this.props.accounts}
                            techCost={this.state.techCost}
                            
                        />
                    )}/>
                    <Route path={`${url}/Tech List`}  render={() => (
                        <TechList    
                        team={ this.props.team }
                        allResearch={this.state.research}
                        techCost={this.state.techCost}
                        accounts={this.props.accounts}
                        />
                    )}/>
                    <Redirect from={`${url}/`} exact to={`${url}/dashboard`} />
                </Switch>
            </Content>
        </Container>
         );
     }
 }

export default Science;