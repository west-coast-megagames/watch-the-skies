import React, { Component } from "react";
import TxtInput from "./common/txtInput";
import Joi from "joi-browser";
import axios from "axios";
import { gameServer } from "../config";

class LoginForm extends Component {
  state = {
    account: { login: "", password: "" },
    errors: {},
  };

  schema = {
    login: Joi.string().required(),
    password: Joi.string().required(),
  };

  validate = () => {
    const result = Joi.validate(this.state.account, this.schema, {
      abortEarly: false,
    });
    console.log(result);

    const errors = {};

    const { account } = this.state;

    if (account.login.trim() === "")
      errors.login = "Username or email is required.";

    if (account.password.trim() === "")
      errors.password = "Password is required";

    return Object.keys(errors).length === 0 ? null : errors;
  };

  validateProperty = ({ name, value }) => {
    if (name === "login") {
      if (value.trim() === "") return "Username or email is required!";
    }
    if (name === "password") {
      if (value.trim() === "") return "Password is required!";
    }
  };

  handleSubmit = async (e) => {
    e.preventDefault();

    // const errors = this.validate();
    // this.setState({ errors: errors || {} });
    // if (errors) return;

    // Call the server
    console.log("Submitted");
    try {
      let res = await axios.post(`${gameServer}api/auth`, this.state.account);
      let jwt = res.data;
      console.log(`Token: ${jwt}`);
      this.props.addAlert({
        type: "success",
        title: "Login Successful",
        body: `Logged in... welcome ${this.state.account.login}!`,
      });
      localStorage.setItem("token", jwt);
      this.props.login();
      this.props.close();
    } catch (err) {
      console.log(`Error: ${err}`);
      const account = { ...this.state.account };
      const errors = { login: "Username or password is incorrect" };
      this.setState({ account, errors });
    }
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
    const { account, errors } = this.state;
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
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
          <button className="btn btn-primary">Login</button>
        </form>
      </div>
    );
  }
}

export default LoginForm;
