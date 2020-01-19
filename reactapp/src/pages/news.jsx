import React, { Component } from 'react'; // React import
import { Nav, Container, Header, Content } from 'rsuite';
import { Route, Switch, NavLink, Redirect } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRssSquare } from '@fortawesome/free-solid-svg-icons'
import NewsFeed from './tabs/news/newsfeed';
import SubNews from '../components/subNews';

class Diplomacy extends Component {
    constructor() {
        super();
        this.state = {
          tab: 'feed'
        };
        this.handleSelect = this.handleSelect.bind(this);
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
                    <Nav.Item eventKey="feed" to={`${url}/feed`} componentClass={NavLink}  icon={<FontAwesomeIcon icon={faRssSquare} />}> feed</Nav.Item>
                    <Nav.Item eventKey="gnn" to={`${url}/gnn`} componentClass={NavLink} > GNN News Feed</Nav.Item>
                    <Nav.Item eventKey="bnc" to={`${url}/bnc`} componentClass={NavLink} > BNC News Feed</Nav.Item>
                    <Nav.Item eventKey="releases" to={`${url}/releases`} componentClass={NavLink} > Press Releases</Nav.Item>
                    <Nav.Item eventKey="add" to={`${url}/add`} componentClass={NavLink} > Add News</Nav.Item>
                </Nav>
            </Header>
            <Content style={{ paddingLeft: 20 }}>
                <Switch>
                    <Route path={`${url}/feed`} render={() => (
                        <NewsFeed agency='All' articles={ this.props.news.gnn.concat(this.props.news.bnc) } />
                    )}/>
                    <Route path={`${url}/add`} render={() => (
                        <SubNews agency = 'GNN' alert={ this.props.alert } />
                    )}/>
                    <Route path={`${url}/gnn`}  render={() => (
                        <NewsFeed agency='GNN' articles={ this.props.news.gnn } />
                    )}/>
                    <Route path={`${url}/bnc`}  render={() => (
                        <NewsFeed agency='BNC' articles={ this.props.news.bnc } />
                    )}/>
                    <Route path={`${url}/releases`}  render={() => (
                        <h5>The press release system for the News Module has not been created!</h5>
                    )}/>
                    <Redirect from={`${url}/`} exact to={`${url}/feed`} />
                </Switch>
            </Content>
        </Container>
         );
     }
 }

export default Diplomacy;