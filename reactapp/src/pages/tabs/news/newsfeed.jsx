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
                    <div  class="artCont" key={ article._id }>
                        <span class="delArticle" data-id={article._id}>X</span>
                        <Panel key={ article._id } header={ article.headline } collapsible bordered>
                            <p>{ article.body }</p>
                        </Panel>
                    </div>
                ))}
            </PanelGroup>
        </Container>
    );
}

export default NewsFeed;