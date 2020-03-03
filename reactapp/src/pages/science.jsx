import React, { Component } from 'react'; // React import
import { Nav, Container, Header, Content, Icon } from 'rsuite';
import { Route, Switch, NavLink, Redirect } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlask, faAtom, faVials, faTools, faMicrochip } from '@fortawesome/free-solid-svg-icons'
import Labs from '../pages/tabs/sci/labs';
import Knowledge from '../pages/tabs/sci/knowledge';
import Salvage from '../pages/tabs/sci/salvage';
import axios from 'axios';
import { gameServer } from '../config';
import ResearchLabs from './tabs/sci/researchLabs';
import TechList from './tabs/sci/techList';

class Science extends Component {
    constructor() {
        super();
        this.state = {
          tab: 'dashboard',
          allResearch : [],
          fundingCost: [],
          techCost: []
        };
        this.handleSelect = this.handleSelect.bind(this);
    }

    componentDidMount() {
        this.loadScience();
    }

    async loadScience() {
        // const {data: rawData} = await axios.get(`${gameServer}api/research`);  // research.data is stored in variable "allResearch"
        const { data } = await axios.get(`${gameServer}api/research/sciState`);  // DREW - data includes fundingCost and techCost array
        let techCost = data.techCost;
        let fundingCost = data.fundingCost;
        // const allResearch = this.removeDuplicates(rawData, 'name');
        // console.log('DUPREMOVE=', allResearch);
        this.setState({ techCost, fundingCost });
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
                            allResearch={this.props.research}
                            //accounts={ this.props.accounts }
                            //alert={ this.props.alert }
                        />
                    )}/>
                    <Route path={`${url}/Tech List`}  render={() => (
                        <TechList    
                        team={ this.props.team }
                        allResearch={this.props.research}
                        techCost={this.state.techCost}
                        //accounts={ this.props.accounts }
                        //alert={ this.props.alert }
                        />
                    )}/>
                    <Route path={`${url}/salvage`} render={() => (
                        <Salvage    
                        team={ this.props.team }
                        allResearch={this.props.research}
                        //accounts={ this.props.accounts }
                        //alert={ this.props.alert }
                        />
                    )}/>
                    <Route path={`${url}/Research Labs`} render={() => (
                        <ResearchLabs 
                            allResearch={this.props.research}
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
                            allResearch={this.props.research}
                            facilities={this.props.facilities}
                            accounts={this.props.accounts}
                            techCost={this.state.techCost}
                            
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