import React from "react"; // React import
import { Container } from "rsuite";
import { Panel, PanelGroup, IconButton, ButtonGroup, ButtonToolbar, Icon } from "rsuite";
import TeamAvatar from "../../../components/common/teamAvatar";

const NewsFeed = props => {
  if (props.articles.length === 0) {
    return <h5>No articles published by {props.agency}</h5>;
  }

  //  alternate background colors of headlines for easy differentiation. {article.agency} for ID//

  return (
    <Container>
      <h5 className="newsFeedHeader">{props.agency} News Feed</h5>
      <PanelGroup>
        {props.articles.map(article => (
            <Panel
              key={article._id}
              header={
                <span>
                  <TeamAvatar size={"sm"} teamCode={article.agency} /><h5 style={{marginLeft:'10px', display: 'inline', verticalAlign:'super'}}>{article.headline}</h5>
                  <ButtonToolbar style={{float: 'right'}}>
                    <ButtonGroup>
                      <IconButton icon={<Icon icon="edit" />} />
                      <IconButton icon={<Icon icon="eye-slash" />} onClick={() => props.hideArticle(article)} />
                      <IconButton icon={<Icon icon="trash" />} color="red"/>
                    </ButtonGroup>
                    <IconButton icon={<Icon icon="file-text" />} color="green"/>
                  </ButtonToolbar>
                </span>}
              bordered
            >
              <p>{article.articleBody}</p>
            </Panel>
        ))}
      </PanelGroup>
    </Container>
  );
};

export default NewsFeed;
