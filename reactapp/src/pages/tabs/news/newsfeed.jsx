import React, { Component } from "react"; // React import
import { connect } from 'react-redux'; // Redux store provider
import { Container } from "rsuite";
import { Panel, PanelGroup, IconButton, ButtonGroup, ButtonToolbar, Icon, Alert, Content, Sidebar, Button, Modal } from "rsuite";
import TeamAvatar from "../../../components/common/teamAvatar";
import { articleHidden } from '../../../store/entities/articles';
import ViewArticle from "../../../components/common/viewArticle";
import SubNews from './subNews'
class NewsFeed extends Component {
  constructor(props) {
    super(props);
    this.state = {
      article: this.props.articles[0],
      filtered: this.props.articles,
      agency: this.props.team.name,
      agencyFilter: [],
      typeFilter: [],
      tagFilter: [],
      view: false,
      editor: false,
      edit: false,
    }
  }

  componentWillUpdate(prevProps) {
    
  }
    
  render() {
    const buttonTxt = this.props.team.teamType === 'M' ? 'Draft new Article' : 'Draft new Press Release';
    const dummyArticle = {
      publisher: this.props.team._id,
      agency: this.props.team.code,
      location: '',
      headline: '',
      articleBody: '',
      tags: [],
      imageSrc: ''
    }

    return (
      <Container>
        <Content>
          {this.props.articles.length === 0 ? <h5>No articles published by {this.state.agency}</h5> : null }
          {this.props.articles.length > 0 ? <PanelGroup>
          {this.props.articles.map(article => (
              <Panel
                key={article._id}
                header={
                  <span>
                    <TeamAvatar size={"sm"} teamCode={article.agency} /><h5 style={{marginLeft:'10px', display: 'inline', verticalAlign:'super'}}>{article.headline}</h5>
                    <ButtonToolbar style={{float: 'right'}}>
                      <ButtonGroup>
                        {article.publisher.name === this.props.team.name ? <IconButton icon={<Icon icon="edit" />} onClick={() => this.setState({editor: true, edit: true, article })} /> : null}
                        <IconButton icon={<Icon icon="eye-slash" />} onClick={() => this.props.hideArticle(article)} />
                        <IconButton icon={<Icon icon="trash" />} onClick={() => this.props.hideArticle(article)} color="red"/>
                      </ButtonGroup>
                      <IconButton icon={<Icon icon="file-text" />} onClick={() => this.setState({view: true, article})} color="green">Open Article</IconButton>
                    </ButtonToolbar>
                  </span>}
                bordered
              >
                <p>{article.articleBody}</p>
              </Panel>
          ))}
        </PanelGroup> : null}
        </Content>
        <Sidebar>
          <IconButton block icon={<Icon icon='file-text' />} onClick={() => this.setState({editor: true, edit: false, article: dummyArticle })}>{buttonTxt}</IconButton>
        </Sidebar>
        <Modal overflow edit={this.pr} size='lg' show={this.state.editor} onHide={() => this.setState({editor: false})}>
          <SubNews edit={this.state.edit} article={this.state.article} onClose={() => this.setState({editor: false})} />
        </Modal>
        <Modal overflow size='lg' show={this.state.view} onHide={() => this.setState({view: false})}>
          <ViewArticle article={this.state.article} onClose={() => this.setState({view: false})} />
        </Modal>
      </Container>
    );
  }
}

const mapStateToProps = state => ({
  login: state.auth.login,
  team: state.auth.team,
  articles: state.entities.articles.list,
  teams: state.entities.teams.list,
  team: state.auth.team,
  lastFetch: state.entities.articles.lastFetch
});

const mapDispatchToProps = dispatch => ({
  hideArticle: article => dispatch(articleHidden(article))
});

export default connect(mapStateToProps, mapDispatchToProps)(NewsFeed);

