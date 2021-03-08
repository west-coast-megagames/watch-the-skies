import React, { Component } from "react";
import { Button } from 'rsuite';
import TxtInput from "./common/txtInput";
import Joi from "joi-browser";
import { loginuser } from "../store/entities/auth";
import { connect } from "react-redux";
import notify from "../scripts/notify";

class LoginForm extends Component {
  state = {
    account: { login: "", password: "" },
		errors: {},
		isLoading: false
  };

  schema = {
    login: Joi.string().required(),
    password: Joi.string().required(),
  };

  componentDidUpdate(prevProps, prevState) {
    if (this.props.errors !== prevProps.errors) {
      notify({catagory: 'app', type: 'error', title: 'Login Failed', body:`Error: ${this.props.errors.login}`});
    }
    if (this.props.login !== prevProps.login) {
      notify({catagory: 'app', type: 'success', title: 'Login Successful...', body: `Welcome to the game ${this.props.user.username}...`})
      notify({catagory: 'app', type: 'success', title: 'Team Login', body: `Logged in as ${this.props.team.name}...`})
      this.props.close();
    }
  }

  // validate = () => {
  //   const result = Joi.validate(this.state.account, this.schema, {
  //     abortEarly: false,
  //   });

  //   const errors = {};

  //   const { account } = this.state;

  //   if (account.login.trim() === "")
  //     errors.login = "Username or email is required.";

  //   if (account.password.trim() === "")
  //     errors.password = "Password is required";

  //   return Object.keys(errors).length === 0 ? null : errors;
  // };

  validateProperty = ({ name, value }) => {
    if (name === "login") {
      if (value.trim() === "") return "Username or email is required!";
    }
    if (name === "password") {
      if (value.trim() === "") return "Password is required!";
    }
  };

  handleSubmit = async (e) => {
		this.setState({ isLoading: true });
		// console.log('Before: ', this.state.isLoading)		

		e.preventDefault();
    // Call the server
    // console.log("Submitted");
		await this.props.handleLogin(this.state.account); // Redux login action
		this.setState({ isLoading: false });
		// console.log('After', this.state.isLoading)
  };

  handleChange = ({ currentTarget: input }) => {
    const errors = { ...this.state.errors };
    const errorMessage = this.validateProperty(input);
    if (errorMessage) errors[input.name] = errorMessage;
    else delete errors[input.name];

    const account = { ...this.state.account };
    account[input.name] = input.value;
    this.setState({ account, errors });
  };

  render() {
    const { account, errors, isLoading } = this.state;
    return (
      <div>
        <form>
          <TxtInput
            name="login"
            value={account.login}
            label="login"
            onChange={this.handleChange}
            error={errors.login}
          />

          <TxtInput
            name="password"
            value={account.password}
            label="Password"
            onChange={this.handleChange}
            error={errors.password}
            type="password"
          />
          <Button appearance="primary" loading={isLoading} onClick={this.handleSubmit}>{isLoading ? 'Loading' : 'Login'}</Button>
        </form>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  user: state.auth.user,
  team: state.auth.team,
  errors: state.auth.errors,
  login: state.auth.login
});

const mapDispatchToProps = dispatch => ({
  handleLogin: (payload) => dispatch(loginuser(payload))
});

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm);

