import React from 'react'
import axios from 'axios'
import { gameServer } from '../config'
import { Form, FormGroup, FormControl, ControlLabel, Button, ButtonToolbar, Schema, DatePicker } from 'rsuite';

const { StringType, NumberType } = Schema.Types;

const model = Schema.Model({
  name: StringType().isRequired('This field is required.'),
  email: StringType()
    .isEmail('Please enter a valid email address.')
    .isRequired('This field is required.'),
  age: NumberType('Please enter a valid number.').range(
    18,
    30,
    'Please enter a number from 18 to 30'
  ),
  password: StringType().isRequired('This field is required.'),
  verifyPassword: StringType()
    .addRule((value, data) => {

      if (value !== data.password) {
        return false;
      }

      return true;
    }, 'The two passwords do not match')
    .isRequired('This field is required.')
});

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

class RegForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formValue: {
        fname: '',
        lname: '',
        username: '',
        email: '',
        dob: undefined,
        password: '',
        verifyPassword: '',
      },
      formError: {}
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleCheckEmail = this.handleCheckEmail.bind(this);
  }

  async handleSubmit() {
    console.log('Form submitted...');
    let { fname, lname, username, email, dob, password } = this.state.formValue
    let user = { name: { first: fname, last: lname }, username, email, dob, password }
    try {
    let res = await axios.post(`${gameServer}user`, user);
    localStorage.setItem('token', res.headers['x-auth-token']);
    this.props.addAlert({
      type: 'success',
      title: 'User Created',
      body: `User created... welcome ${res.data.username}!`})
    this.props.login()
    this.props.close();  
    } catch (err) {
      console.log(err)
      this.props.addAlert({
        type: 'error',
        title: 'Failed to create user',
        body: `${err.message}`})
    }
    
  }

  handleCheckEmail() {
    this.form.checkForField('email', checkResult => {
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
        model={model}
      >
        <TextField name="fname" label="First Name" />
        <TextField name="lname" label="Last Name" />
        <TextField name="username" label="Username" />

        <TextField name="email" label="Email" />

        <TextField block name="dob" label="Date of Birth" accepter={DatePicker} />
        
        <TextField name="password" label="Password" type="password" />

        <TextField
          name="verifyPassword"
          label="Verify password"
          type="password"
        />

        <ButtonToolbar>
          <Button appearance="primary" onClick={this.handleSubmit}>
            Submit
          </Button>

          <Button onClick={this.handleCheckEmail}>Check Email</Button>
        </ButtonToolbar>
      </Form>
    );
  }
}

export default RegForm;