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
          <div className="artCont" key={article._id}>
            {/* Individual Agency Logo/Flag here for easy ID by user */}
            {/* OLD WAY - DELETE AFTER NEW WAY WORKS
            {article.agency === "GNN" && (
              <img src={GNN} style={{ maxWidth: "30px" }} />
            )}
            {article.agency === "BNC" && (
              <img src={BNC} style={{ maxWidth: "30px" }} />
            )}
            {article.agency === "US" && (
              <img
                src="https://cdn.countryflags.com/thumbs/united-states-of-america/flag-round-250.png"
                style={{ maxWidth: "30px" }}
              />
            )}

            USA: "https://cdn.countryflags.com/thumbs/united-states-of-america/flag-round-250.png",
                RFD: "https://cdn.countryflags.com/thumbs/russia/flag-square-250.png",
                PRC: "https://cdn.countryflags.com/thumbs/china/flag-square-250.png",
                TUK: "https://cdn.countryflags.com/thumbs/united-kingdom/flag-square-250.png",
                TFR: "https://cdn.countryflags.com/thumbs/france/flag-square-250.png",
                FFG: "" */}

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
          </div>
        ))}
      </PanelGroup>
    </Container>
  );
};

export default NewsFeed;
