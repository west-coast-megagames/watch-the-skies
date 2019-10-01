import React, { Component } from 'react';

class LiginForm extends Component {
    state = {
        account: { username: '', password: ''}
    };

    handleSubmit = e => {
        e.preventDefault();

        // Call the server
        console.log('Submitted');
    };

    handleChange = ({currentTarget: input}) => {
        const account = {...this.state.account};
        account[input.name] = input.value;
        this.setState({ account })
    };

    render() {
        const { account } = this.state;
        return <div>
            <h1>Login</h1>
            <form onSubmit={this.handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input 
                        autoFocus
                        value={account.username}
                        onChange={this.handleChange}
                        id="username"
                        name="username"
                        type="text"
                        className="form-control"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        value={account.password}
                        onChange={this.handleChange}
                        name="password"
                        id="password"
                        type="text"
                        className="form-control"
                    />
                </div>
                <button className="btn btn-primary">Login</button>
            </form>
        </div>;
    }
}
 
export default LiginForm;