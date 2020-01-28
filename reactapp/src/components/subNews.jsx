import React from 'react'
import axios from 'axios'
import { gameServer } from '../config'
import { Form, FormGroup, FormControl, ControlLabel, Button, ButtonToolbar } from 'rsuite';


class TextField extends React.PureComponent {
  render() {
    const { name, label, accepter, ...props } = this.props;
    return (
      <FormGroup>
        <ControlLabel>{label} </ControlLabel>
        <FormControl name={name} accepter={accepter} {...props} />
      </FormGroup>
    );
  }
}

class SubNews extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formValue: {
        agency: "",
        location: "",
        headline: "",
        body: "",
        imageSrc: ""
      },
      formError: {}
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async handleSubmit() {
    console.log('Form submitted...');
    console.dir(this.state.formValue);
    try {
        let resArticle = await axios.post(`${gameServer}api/news`, this.state.formValue);
        //localStorage.setItem('token', res.headers['x-auth-token']);
        this.props.alert({
            type: 'success',
            title: 'News Item Submitted',
            body: `News with headline:  ${resArticle.data.headline}!`
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

  handleCheckNews() {
    this.form.checkForField('news', checkResult => {
      console.log(checkResult);
    });
  }
  render() {
    const { formValue } = this.state;

    return (
      <Form
        fluid
        ref={ref => (this.form = ref)}
        onChange={formValue => {
          this.setState({ formValue });
        }}
        onCheck={formError => {
          this.setState({ formError });
        }}
        formValue={formValue}
      >

        <TextField name="agency" label="News Agency" />
        <TextField name="location" label="Location" />
        <TextField name="headline" label="Headline" />

        <TextField name="body" label="Body" />
        
        <TextField name="img" label="Image Source" />

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