import React from 'react'
import axios from 'axios'
import { gameServer } from '../config'
import { Form, FormGroup, FormControl, Button, ButtonToolbar, SelectPicker, Input } from 'rsuite';
//import Select from '../components/common/selectPicker';

/*class TextField extends React.PureComponent {
  render() {
    const { name, label, accepter, ...props } = this.props;
    return (
      <FormGroup>
        <ControlLabel>{label} </ControlLabel>
        <FormControl name={name} accepter={accepter} {...props} />
      </FormGroup>
    );
  }
}*/



class SubNews extends React.Component {
  /*constructor(props) {
    super(props);
    this.state = {
      article: {
        agency: "",
        location: "",
        headline: "",
        body: "",
        imageSrc: ""
      }
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInput = this.handleInput.bind(this);
  }
  */

    state = {
    article: {
      agency: "",
      location: "",
      headline: "",
      body: "",
      imageSrc: ""
    }}

    handleInput = (value, id) => {
        console.log(this);
        console.log(value);
        console.log(id);

        let article = this.state.article;
        article[id] = value;
        this.setState({ article });
    };


/*
  async handleSubmit() {
    console.log('Form submitted...');
    console.dir(this.state.formValue);
    try {
        let resArticle = await axios.post(`${gameServer}api/news`, this.state.formValue);
        //localStorage.setItem('token', res.headers['x-auth-token']);
        this.props.alert({
            type: 'success',
            title: 'News Item Submitted',
            body: 'News with headline:  ${resArticle.data.headline}!'
        })
        this.props.login()
        this.props.close();  
    } catch (err) {
        console.log(err)
        this.props.alert({
            type: 'error',
            title: 'Failed to create news item',
            body: `${err.message}`})
    }
  }
  */

    handleSubmit = async e => {
        e.preventDefault();
        try {
            let resArticle = await axios.post(`${gameServer}api/news`, this.state.article);
            //localStorage.setItem('token', res.headers['x-auth-token']);
            this.props.alert({
                type: 'success',
                title: 'News Item Submitted',
                body: `News with headline:  ${resArticle.data.headline}!`
            }) 
        } catch (err) {
            console.log(err)
            this.props.alert({
                type: 'error',
                title: 'Failed to create news item',
                body: `${err.message}`})
        }
    }

  handleCheckNews() {
    this.form.checkForField('news', checkResult => {
      console.log(checkResult);
    });
  }
  render() {
    const { body, headline, imageSrc  } = this.state.article;


    const agency = [
        {value: 'BNC', label: 'BNC'},
        {value: 'GNN', label: 'GNN'},
        {value: 'US', label: 'US'}
    ];

    return (
      <Form>
        <FormGroup>
          <SelectPicker id="agency" data={agency} style={{ width: 224 }}  labelKey='label' valueKey='value' placeholder='pick your origin' onChange={(value)=>this.handleInput(value, 'agency')}/>
          <SelectPicker id="agency" data={agency} style={{ width: 224 }}  labelKey='label' valueKey='value' placeholder='pick your origin' onChange={(value)=>this.handleInput(value, 'agency')}/>
        </FormGroup>

        <FormGroup>
          <Input id='location' type="text" value={this.state.article.location} name="location" label="Location"  placeholder='location'  onChange={(value)=>this.handleInput(value, 'location')}/>
        </FormGroup>

        <FormGroup>
          <Input id='headline' type="text" value={headline} name="headline" label="Headline"  placeholder='headline' onChange={(value)=>this.handleInput(value, 'headline')} />
        </FormGroup>

        <FormGroup>
          <FormControl id='body' componentClass="textarea" rows={6} name="body" value={body} onChange={(value)=>this.handleInput(value, 'body')} />
        </FormGroup>
        
        <FormGroup>
        <Input id='imageSrc' type="text" value={imageSrc} name="img" label="Image Source" placeholder='img' onChange={(value)=>this.handleInput(value, 'imageSrc')} />
        </FormGroup>

        <ButtonToolbar>
          <Button appearance="primary" onClick={this.handleSubmit}>
            Submit
          </Button>
        </ButtonToolbar>
      </Form>
    );
  }
}

export default SubNews;