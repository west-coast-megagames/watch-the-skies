import React from "react";
import { connect } from 'react-redux'; // Redux store provider
import axios from "axios";
import { gameServer } from "../../../config";
import TeamAvatar from "../../../components/common/teamAvatar";
import { Alert, Form, FormGroup, FormControl, Button, ButtonToolbar, SelectPicker, TreePicker, Input, Modal, Toggle, Divider } from "rsuite";

class SubNews extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      article: {...this.props.article},
      data: [],
      preview: false
    }
    this.handleInput = this.handleInput.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handlePreview = this.handlePreview.bind(this);
    this.getLocation = this.getLocation.bind(this);
  }

  componentDidMount () {
    this.formatPickerData();
  }

  handleInput = (value, id) => {
    // console.log(this);
    console.log(value);
    console.log(id);
    let article = this.state.article;
    article[id] = value;
    if (id === 'location' && value === null) article['location'] =  { _id:'' }
    this.setState({ article });
  };

  handleSubmit = async e => {
    e.preventDefault();
    let edit = this.props.edit;
    let resArticle = this.state.article;
    try {
      if (edit) {
        resArticle = await axios.put(`${gameServer}api/news/${this.state.article._id}`, this.state.article);
      } else if (!edit) {
        resArticle = await axios.post(`${gameServer}api/news`, this.state.article);
      }
      Alert.success(`News article submitted: ${resArticle.data.headline}`);
      this.setState({article: {
        publisher: this.props.team._id,
        agency: this.props.team.code,
        location: '',
        headline: '',
        articleBody: '',
        tags: [],
        imageSrc: ''
      }})
      this.props.onClose();
    } catch (err) {
      Alert.error(`Failed to create news item - Error: ${err.message}`);
    }
  };

  handlePreview = (value) => { this.setState({preview: value})};

  getLocation = () => {
    if (typeof(this.state.article.location) === 'object') return this.state.article.location._id;
    if (typeof(this.state.article.location) === 'string') return this.state.article.location
  };

  render() {
    const { articleBody, headline, imageSrc } = this.state.article;
    const location = this.getLocation() 
    let preview = this.state.preview;
    let disabled = articleBody.length !== 50 && headline.length !== 10 ? false : true;

    return (
      <React.Fragment>
         <Modal.Header>
          <Modal.Title>
            <TeamAvatar size={"sm"} teamCode={this.props.team.code} />
            { !preview && <span> Submit {this.props.team.teamType === 'N' && 'Press Release'}{this.props.team.teamType === 'M' && 'Article'}</span> }
            { preview && <span> {headline}</span> }
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          { !preview && <Form fluid>
          <FormGroup>
              <Input
                id="headline"
                type="text"
                value={headline}
                name="headline"
                label="Headline"
                placeholder="Enter your headline..."
                onChange={value => this.handleInput(value, "headline")}
              />
            </FormGroup>
            <FormGroup>
              {this.props.team.teamType === 'C' && 
                <SelectPicker
                  block
                  id="publisher"
                  data={this.props.teams}
                  labelKey="shortName"
                  valueKey="_id"
                  placeholder="Select Publisher..."
                  onChange={value => this.handleInput(value, "publisher")}
                /> }
                <TreePicker
                  block
                  id="location"
                  value={location}
                  data={this.state.data}
                  labelKey='name'
                  valueKey='_id'
                  placeholder="Choose the Location..."
                  onChange={value => this.handleInput(value, "location")}
                />
            </FormGroup>
            <FormGroup>
            <FormControl
              id="articleBody"
              componentClass="textarea"
              placeholder="Write your article..."
              rows={10}
              name="articleBody"
              value={articleBody}
              onChange={value => this.handleInput(value, "articleBody")}
            />
          </FormGroup>
          <FormGroup>
            <Input
              id="imageSrc"
              type="text"
              value={imageSrc}
              name="img"
              label="Image Source"
              placeholder="img"
              onChange={value => this.handleInput(value, "imageSrc")}
            />
          </FormGroup>
            <ButtonToolbar>
              <Button disabled={disabled} appearance="primary" onClick={this.handleSubmit}>
                Submit {this.props.team.teamType === 'N' && 'Press Release'}{this.props.team.teamType === 'M' && 'Article'}
              </Button>
            </ButtonToolbar>
          </Form> }
          {preview && <span>
          <p><b>Author:</b> {this.props.user} | <b>Publisher:</b> {this.props.team.name}</p>
          {typeof(location) === 'object' && <p>{this.props.sites.find(el => el._id === location._id).dateline} - Turn</p> }
          {typeof(location) === 'string' && <p>{this.props.sites.find(el => el === location)}.dateline - Turn</p> }
          <Divider />
          <p>{articleBody}</p>
          </span> }
        </Modal.Body>
        <Modal.Footer>
          <Toggle style={{float: 'right'}} onChange={this.handlePreview} size="md" checkedChildren="Edit Article" unCheckedChildren="Peview" />  
        </Modal.Footer>
      </React.Fragment>
    );
  }

  formatPickerData = () => {
    console.log('Formatting Picker...')
    let zones = this.props.zones.filter(el => el.type !== 'Space').map((item) => Object.assign({}, item, {selected:false}));
    let countries = this.props.countries.map((item) => Object.assign({}, item, {selected:false}));
    let sites = this.props.sites.map((item) => Object.assign({}, item, {selected:false}));
    
    for (let country of countries) {
      country.children = sites.filter(el => el.country.name === country.name);
    };

    for (let zone of zones) {
      zone.children = countries.filter(el => el.zone.name === zone.name);
      zone.name = zone.name;
    };
    this.setState({ data: zones })
  }
}

const mapStateToProps = state => ({
  login: state.auth.login,
  user: state.auth.user,
  team: state.auth.team,
  zones: state.entities.zones.list,
  countries: state.entities.countries.list,
  sites: state.entities.sites.list
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(SubNews);
