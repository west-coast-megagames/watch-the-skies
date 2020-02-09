import React, { Component } from 'react'; // React import
import { Nav, Container, Header, Content, Icon, Progress } from 'rsuite';
import { Route, Switch, NavLink, Redirect } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlask, faAtom, faVials, faTools } from '@fortawesome/free-solid-svg-icons'
import KnowledgeCard from '../components/common/knowledgeCard';
import Labs from '../pages/tabs/sci/labs';
import Knowledge from '../pages/tabs/sci/knowledge';
import Salvage from '../pages/tabs/sci/salvage';
import MySelectPicker from '../pages/tabs/sci/myselectpicker';
import Axios from 'axios';
import { gameServer } from '../config';


class Science extends Component {
    constructor() {
        super();
        this.state = {
          tab: 'dashboard',
          allKnowledge : [],
          fundingCost: [],
          techCost: []
        };
        this.handleSelect = this.handleSelect.bind(this);
    }

    async loadScience() {
        const {data: rawData} = await Axios.get(`${gameServer}api/research`);  // research.data is stored in variable "allKnowledge"
        const { data } = await Axios.get(`${gameServer}api/research/sciState`);  // DREW - data includes fundingCost and techCost array
        let techCost = data.techCost;
        let fundingCost = data.fundingCost;
        const allKnowledge = this.removeDuplicates(rawData, 'name');
//        console.log('DUPREMOVE=', allKnowledge);
        this.setState({ allKnowledge, techCost, fundingCost });
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
                    <Nav.Item eventKey="trial" to={`${url}/trial`} componentClass={NavLink}icon={<FontAwesomeIcon icon={faTools} />}> Trial</Nav.Item>
                </Nav>
            </Header>
            <Content style={{ paddingLeft: 20 }}>
                <Switch>
                    <Route path={`${url}/dashboard`} render={() => (
                        //<h5>No dashboard has been coded for the Science Module!</h5>
                        <button onClick = {() => {this.loadScience()}} >LOAD SCIENCE</button>
                    )}/>
                    <Route path={`${url}/research`}  render={() => (
                        <Labs    
                            team={ this.props.team }
                            allKnowledge={this.state.allKnowledge}
                            //accounts={ this.props.accounts }
                            //handleUpdate={ this.props.handleUpdate }
                            //alert={ this.props.alert }
                        />
                    )}/>
                    <Route path={`${url}/knowledge`} render={() => (
                        <Knowledge    
                        team={ this.props.team }
                        allKnowledge={this.state.allKnowledge}
                        //accounts={ this.props.accounts }
                        //handleUpdate={ this.props.handleUpdate }
                        //alert={ this.props.alert }
                        />
                    )}/>
                    <Route path={`${url}/applied`}  render={() => (
                        <React.Fragment>
                        <div className="card-group">
                            <KnowledgeCard name="Test Tech" desc="Look at the science! What happens if I put more and more text here?" />
                            <KnowledgeCard name="Test Tech" desc="Look at the science! What happens if I put more and more text here?" />
                            <KnowledgeCard name="Test Tech" desc="Look at the science! What happens if I put more and more text here?" />
                            <KnowledgeCard name="Test Tech" desc="Look at the science! What happens if I put more and more text here?" />
                            <KnowledgeCard name="Test Tech" desc="Look at the science! What happens if I put more and more text here?" />
                        </div>
                        <div className="card-group">
                            <KnowledgeCard name="Test Tech" desc="Look at the science! What happens if I put more and more text here?" />
                            <KnowledgeCard name="Test Tech" desc="Look at the science! What happens if I put more and more text here?" />
                            <KnowledgeCard name="Test Tech" desc="Look at the science! What happens if I put more and more text here?" />
                            <KnowledgeCard name="Test Tech" desc="Look at the science! What happens if I put more and more text here?" />
                            <KnowledgeCard name="Test Tech" desc="Look at the science! What happens if I put more and more text here?" />
                        </div>
                        </React.Fragment>
                    )}/>
                    <Route path={`${url}/salvage`} render={() => (
                        <Salvage    
                        team={ this.props.team }
                        allKnowledge={this.state.allKnowledge}
                        //accounts={ this.props.accounts }
                        //handleUpdate={ this.props.handleUpdate }
                        //alert={ this.props.alert }
                        />
                    )}/>
                    <Route path={`${url}/trial`} render={() => (
                        <MySelectPicker    
                        team={ this.props.team }
                        allKnowledge={this.state.allKnowledge}
                        //accounts={ this.props.accounts }
                        //handleUpdate={ this.props.handleUpdate }
                        //alert={ this.props.alert }
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