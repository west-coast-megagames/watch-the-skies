import React, { Component } from "react"; // React import
import { Container } from "rsuite";
import { connect } from 'react-redux'; // Redux store provider
import { Panel, PanelGroup, IconButton, ButtonGroup, ButtonToolbar, Icon, Alert } from "rsuite";
import TeamAvatar from "../../../components/common/teamAvatar";
import { articleHidden } from '../../../store/entities/articles';
class NewsFeed extends Component {
  render() { 
    if (this.props.articles.length === 0) {
      return <h5>No articles published by {this.props.agency}</h5>;
    }

    return (
      <Container>
        <h5 className="newsFeedHeader">{this.props.agency} News Feed</h5>
        <PanelGroup>
          {this.props.articles.map(article => (
              <Panel
                key={article._id}
                header={
                  <span>
                    <TeamAvatar size={"sm"} teamCode={article.agency} /><h5 style={{marginLeft:'10px', display: 'inline', verticalAlign:'super'}}>{article.headline}</h5>
                    <ButtonToolbar style={{float: 'right'}}>
                      <ButtonGroup>
                        {article.publisher.name === this.props.team.name ? <IconButton icon={<Icon icon="edit" />} onClick={() => Alert.warning('Editing articles is not implemented')} /> : null}
                        <IconButton icon={<Icon icon="eye-slash" />} onClick={() => this.props.hideArticle(article)} />
                        <IconButton icon={<Icon icon="trash" />} onClick={() => this.props.hideArticle(article)} color="red"/>
                      </ButtonGroup>
                      <IconButton icon={<Icon icon="file-text" />} onClick={() => Alert.warning('Full article view is not implemented', 4000)} color="green">Open Article</IconButton>
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
  }
}

const mapStateToProps = state => ({
  login: state.auth.login,
  articles: state.entities.articles.list,
  teams: state.entities.teams.list,
  team: state.auth.team
});

const mapDispatchToProps = dispatch => ({
  hideArticle: article => dispatch(articleHidden(article))
});

export default connect(mapStateToProps, mapDispatchToProps)(NewsFeed);