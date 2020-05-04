import React from "react"; // React import
import { Container } from "rsuite";
import { Panel, PanelGroup } from "rsuite";
import TeamAvatar from "../../../components/common/teamAvatar";

const NewsFeed = props => {
  if (props.articles.length === 0) {
    return <h5>No articles published by {props.agency}</h5>;
  }

  //  alternate background colors of headlines for easy differentiation. {article.agency} for ID//

  return (
    <Container>
      <h5 className="newsFeedHeader">{props.agency} News Feed</h5>
      <PanelGroup accordion bordered>
        {props.articles.map(article => (
            <Panel
              key={article._id}
              header={<span><TeamAvatar size={"sm"} teamCode={article.agency} /><h5 style={{marginLeft:'10px', display: 'inline', verticalAlign:'super'}}>{article.headline}</h5></span>}
              collapsible
              bordered
            >
              <p>{article.articleBody}</p>
              <button style={{display: 'inline'}}
              onClick={() => props.del(article)}
              className="btn btn-danger btn-sm m-1"
            >
              Trash
            </button>
            </Panel>
        ))}
      </PanelGroup>
    </Container>
  );
};

export default NewsFeed;
