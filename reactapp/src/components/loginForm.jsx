import React, { Component } from 'react';
import TxtInput from './common/txtInput';
import Joi from 'joi-browser';

class LiginForm extends Component {
    state = {
        account: { username: '', password: ''},
        errors: {}
    };

    schema = {
        username: Joi.string().required(),
        password: Joi.string().required()
    };

    validate = () => {
        const result = Joi.validate(this.state.account, this.schema, { abortEarly: false });
        console.log(result)
        
        const errors = {};

        const { account } = this.state

        if (account.username.trim() === '')
            errors.username = "Username is required."
        
        if (account.password.trim() === '')
            errors.password = "Password is required"

        return Object.keys(errors).length === 0 ? null : errors
    };

    validateProperty = ({ name, value }) => {
        if (name === 'username') {
            if (value.trim() === "") return 'Username is required!';
        }
        if (name === 'password') {
            if (value.trim() === "") return 'Password is required!';
        }
    };

    handleSubmit = e => {
        e.preventDefault();

        const errors = this.validate();
        this.setState({ errors: errors || {} });
        if (errors) return;

        // Call the server
        console.log('Submitted');
    };

    handleChange = ({currentTarget: input}) => {
        const errors = { ...this.state.errors };
        const errorMessage = this.validateProperty(input);
        if (errorMessage) errors[input.name] = errorMessage;
        else delete errors[input.name];

        const account = {...this.state.account};
        account[input.name] = input.value;
        this.setState({ account, errors })
    };

    render() {
        const { account, errors } = this.state;
        return <div>
            <h1>Login</h1>
            <form onSubmit={this.handleSubmit}>
                <TxtInput
                    name="username"
                    value={account.username}
                    label="Username"
                    onChange={this.handleChange}
                    error={errors.username}
                />

                <TxtInput
                    name="password"
                    value={account.password}
                    label="Password"
                    onChange={this.handleChange}
                    error={errors.password}
                />

                <button className="btn btn-primary">Login</button>
            </form>
        </div>;
    }
}
 
export default LiginForm;