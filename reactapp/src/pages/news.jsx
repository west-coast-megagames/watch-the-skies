import React, { Component } from 'react'; // React import
import { connect } from 'react-redux'; // Redux store provider
import { Nav, Container, Header, Content } from 'rsuite';
import { Route, Switch, NavLink, Redirect } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRssSquare } from '@fortawesome/free-solid-svg-icons'
import NewsFeed from './tabs/news/newsfeed';
import LoginLink from '../components/common/loginLink';


const News = (props) => {
	const [tab, setTab] = React.useState('feed');
	const url = props.match.path;

	if (!props.login) {
		props.history.push('/');
		return <LoginLink history={props.history} />
	}
	else return (
		<Container>
			<Header>
				<Nav appearance="tabs" activeKey={ tab } onSelect={(thing) => setTab(thing)} style={{ marginBottom: 10 }}>
					<Nav.Item eventKey="feed" to={`${url}/feed`} componentClass={NavLink}  icon={<FontAwesomeIcon icon={faRssSquare} />}> News feed</Nav.Item>
				</Nav>
			</Header>
			<Content className='tabContent' style={{ paddingLeft: 20 }}>
				<Switch>
					<Route path={`${url}/feed`} render={() => (
						<NewsFeed 
							agency='All' 
							articles={ props.articles } 
							teams={props.teams}  
						/>
					)}/>
					<Redirect from={`${url}/`} exact to={`${url}/feed`} />
				</Switch>
			</Content>
		</Container>
	);
	
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
