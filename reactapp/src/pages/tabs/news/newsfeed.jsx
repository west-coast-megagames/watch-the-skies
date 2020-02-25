import React from "react"; // React import
import { Container } from "rsuite";
import { Panel, PanelGroup } from "rsuite";

const NewsFeed = props => {
  if (props.articles.length === 0) {
    return <h5>No articles published by {props.agency}</h5>;
  }

  //  alternate background colors of headlines for easy differentiation. {article.agency} for ID//

  return (
    <Container>
      <h5>{props.agency} News Feed</h5>
      <PanelGroup style={{ paddingTop: 10 }}>
        {props.articles.map(article => (
          <div className="artCont" key={article._id}>
            {/* Individual Agency Logo/Flag here for easy ID by user */}
            <img src="https://cdn.countryflags.com/thumbs/united-states-of-america/flag-round-250.png" />
            <button
              onClick={() => props.del(article)}
              className="btn btn-danger btn-sm m-1"
            >
              X
            </button>
            <Panel
              key={article._id}
              header={article.headline}
              collapsible
              bordered
            >
              <p>{article.body}</p>
            </Panel>
          </div>
        ))}
      </PanelGroup>
    </Container>
  );
};

export default NewsFeed;
