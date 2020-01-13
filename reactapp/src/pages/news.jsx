import React, { Component } from 'react'; // React import
import { Nav, Container, Header, Content, Icon } from 'rsuite';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRssSquare } from '@fortawesome/free-solid-svg-icons'
import NewsFeed from './tabs/news/newsfeed';

class Diplomacy extends Component {
    constructor() {
        super();
        this.state = {
          tab: 'posts'
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
                    <Nav.Item eventKey="posts"  icon={<FontAwesomeIcon icon={faRssSquare} />}> feed</Nav.Item>
                    <Nav.Item eventKey="gnn" > GNN News Feed</Nav.Item>
                    <Nav.Item eventKey="bnc" > BNC News Feed</Nav.Item>
                    <Nav.Item eventKey="releases" > Press Releases</Nav.Item>
                </Nav>
            </Header>
            <Content style={{ paddingLeft: 20 }}>
                <Container className="posts" hidden={ this.getActive('posts')} >
                    <h5>No posts feed has been coded for the News Module!</h5>
                </Container>
                <Container className="gnn" hidden={ this.getActive('gnn') }>
                    <NewsFeed agency='GNN' articles={ this.props.news.gnn } />
                </Container>
                <Container className="bnc" hidden={ this.getActive('bnc') }>
                    <NewsFeed agency='BNC' articles={ this.props.news.bnc } />
                </Container>
                <Container className="releases" hidden={ this.getActive('releases') }>
                    <h5>The press release system for the News Module has not been created!</h5>
                </Container>
            </Content>
        </Container>
         );
     }
 }

export default Diplomacy;