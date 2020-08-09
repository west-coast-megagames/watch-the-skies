import React from "react";
import axios from "axios";
import { gameServer } from "../../../config";
import { Alert, Form, FormGroup, FormControl, Button, ButtonToolbar, SelectPicker, TreePicker, Input } from "rsuite";

class SubNews extends React.Component {
  state = {
    article: {
      publisher: this.props.team._id,
      agency: this.props.team.code,
      location: "",
      headline: "",
      body: "",
      tags: [],
      imageSrc: ""
    },
    data: []
  };

  handleInput = (value, id) => {
    // console.log(this);
    // console.log(value);
    // console.log(id);
    let article = this.state.article;
    article[id] = value;
    this.setState({ article });
  };

  componentDidMount () {
    this.formatPickerData();
  }

  handleSubmit = async e => {
    e.preventDefault();
    try {
      let resArticle = await axios.post(`${gameServer}api/news`, this.state.article);
      
      Alert.success(`News article submitted: ${resArticle.data.headline}`);
    } catch (err) {
      Alert.error(`Failed to create news item - Error: ${err.message}`);
    }
  };

  handleCheckNews() {
    this.form.checkForField("news");
  }
  render() {
    const { body, headline, imageSrc, location } = this.state.article;

    return (
      <Form fluid>
        <FormGroup>
          {this.props.team.teamType === 'C' && 
          <SelectPicker
            id="publisher"
            data={this.props.teams}
            style={{ width: 500 }}
            labelKey="shortName"
            valueKey="_id"
            placeholder="Select Publisher..."
            onChange={value => this.handleInput(value, "publisher")}
          />}
          <TreePicker 
            id="location"
            defaultExpandAll
            value={location}
            data={this.state.data}
            labelKey='name'
            valueKey='_id'
            placeholder="Choose the Location..."
            onChange={value => this.handleInput(value, "location")}
            style={{ width: 500 }}
          />
        </FormGroup>
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
          <FormControl
            id="body"
            componentClass="textarea"
            placeholder="Write your article..."
            rows={10}
            name="body"
            value={body}
            onChange={value => this.handleInput(value, "body")}
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
          <Button appearance="primary" onClick={this.handleSubmit}>
            Submit {this.props.team.teamType === 'N' && 'Press Release'}{this.props.team.teamType === 'M' && 'Article'}
          </Button>
        </ButtonToolbar>
      </Form>
    );
  }

  formatPickerData = () => {
    console.log('Formatting Picker...')
    let zones = this.props.zones.map((item) => Object.assign({}, item, {selected:false}));
    let countries = this.props.countries.map((item) => Object.assign({}, item, {selected:false}));
    let sites = this.props.sites.map((item) => Object.assign({}, item, {selected:false}));
    
    for (let country of countries) {
      country.children = sites.filter(el => el.country.name === country.name);
    };

    for (let zone of zones) {
      zone.children = countries.filter(el => el.zone.zoneName === zone.zoneName);
      zone.name = zone.zoneName;
    };
    this.setState({ data: zones })
  }
}

export default SubNews;
