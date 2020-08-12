import React, { Component } from 'react'; // React import
import { connect } from 'react-redux'; // Redux store provider
import { Nav, Container, Header, Content } from 'rsuite';
import { Route, Switch, NavLink, Redirect } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRssSquare } from '@fortawesome/free-solid-svg-icons'
import NewsFeed from './tabs/news/newsfeed';
import SubNews from './tabs/news/subNews';
import LoginLink from '../components/common/loginLink';


class News extends Component {
    state = {
        tab: 'feed',
    };

    handleSelect = (activeKey) => {
        this.setState({ tab: activeKey })
    }

    render() {
        if (!this.props.login) return <LoginLink />

        const url = this.props.match.path;
        const { tab } = this.state; 

        return (
        <Container>
            <Header>
                <Nav appearance="tabs" activeKey={ tab } onSelect={this.handleSelect} style={{ marginBottom: 10 }}>
                    <Nav.Item eventKey="feed" to={`${url}/feed`} componentClass={NavLink}  icon={<FontAwesomeIcon icon={faRssSquare} />}> News feed</Nav.Item>
                </Nav>
            </Header>
            <Content className='tabContent' style={{ paddingLeft: 20 }}>
                <Switch>
                    <Route path={`${url}/feed`} render={() => (
                        <NewsFeed 
                            agency='All' 
                            articles={ this.props.articles } 
                            teams={this.props.teams}  
                        />
                    )}/>
                    <Redirect from={`${url}/`} exact to={`${url}/feed`} />
                </Switch>
            </Content>
        </Container>
        );
    }
}

const mapStateToProps = state => ({
    login: state.auth.login,
    articles: state.entities.articles.list,
    teams: state.entities.teams.list,
    team: state.auth.team,
    sites: state.entities.sites.list,
    zones: state.entities.zones.list,
    countries: state.entities.countries.list
});
  
const mapDispatchToProps = dispatch => ({});
export default connect(mapStateToProps, mapDispatchToProps)(News);
