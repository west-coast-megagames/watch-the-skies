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
      <h5>{props.agency} News Feed</h5>
      <PanelGroup style={{ paddingTop: 10 }}>
        {props.articles.map(article => (
          <div
            className="artCont"
            key={article._id}
            style={{
              border: "solid 2px #d9d9d9",
              margin: 10,
              padding: "5px 2px 0px 5px",
              borderRadius: "6px 6px 6px 6px",
              backgroundColor: "#f2f2f2"
            }}
          >
            <button
              onClick={() => props.del(article)}
              className="btn btn-danger btn-sm m-1"
              style={{ float: "right", display: "inline-block" }}
            >
              Trash
            </button>

            {/* Individual Agency Logo/Flag here for easy ID by user */}
            <TeamAvatar size={"sm"} teamCode={article.agency} />

            {/* OLD WAY
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
