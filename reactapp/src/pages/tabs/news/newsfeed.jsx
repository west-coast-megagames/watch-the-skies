import React from 'react'; // React import
import { Container } from 'rsuite';
import { Panel, PanelGroup } from 'rsuite';

const NewsFeed = (props) => {
    if (props.articles.length === 0) {
        return(
            <h5>No articles published by { props.agency }</h5>
        )
    };
    
    return (
        <Container style={{ paddingTop: 10 }}>
            <h5>{ props.agency } News Feed</h5>
            <PanelGroup style={{ paddingTop: 10 }}>
                { props.articles.map( article => (
                    <Panel key={ article._id } header={ article.headline } collapsible bordered>
                        <p>{ article.body }</p>
                    </Panel>
                ))}
            </PanelGroup>
        </Container>
    );
}

export default NewsFeed;