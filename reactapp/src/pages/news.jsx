import React, { Component } from 'react'; // React import
import { Nav, Container, Header, Content } from 'rsuite';
import { Route, Switch, NavLink, Redirect } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRssSquare } from '@fortawesome/free-solid-svg-icons'
import NewsFeed from './tabs/news/newsfeed';
import SubNews from '../components/subNews';

class News extends Component {
    state = {
        tab: 'feed',
    };

    handleSelect = (activeKey) => {
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
            <Content  className='tabContent' style={{ paddingLeft: 20 }}>
                <Switch>
                    <Route path={`${url}/feed`} render={() => (
                        <NewsFeed agency='All' articles={ this.props.articles } teams={this.props.teams}  del={this.props.handleArtHide} />
                    )}/>
                    
                    <Route path={`${url}/gnn`}  render={() => (
                        <NewsFeed agency='GNN' articles={ this.props.articles.filter(el => el.agency==='GNN') } teams={this.props.teams}  del={this.props.handleArtHide} />
                    )}/>
                    <Route path={`${url}/bnc`}  render={() => (
                        <NewsFeed agency='BNC' articles={ this.props.articles.filter(el => el.agency==='BNC') } teams={this.props.teams}  del={this.props.handleArtHide}/>
                    )}/>
                    <Route path={`${url}/releases`}  render={() => (
                        <NewsFeed agency='Press Releases' articles={ this.props.articles.filter(el => el.agency!=='GNN' && el.agency!=='BNC') } teams={this.props.teams} del={this.props.handleArtHide}  />
                    )}/>

                    <Route path={`${url}/add`} render={(props) => (
                        <SubNews {...props} alert={ this.props.alert } />
                    )}/>
                    <Redirect from={`${url}/`} exact to={`${url}/feed`} />
                </Switch>
            </Content>
        </Container>
         );
     }
 }

export default News;