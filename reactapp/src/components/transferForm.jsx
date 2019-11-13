import axios from 'axios';
import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBillAlt } from '@fortawesome/free-solid-svg-icons';

class TransferForm extends Component {
    state = { accounts: {} }

    async getAccounts(team) {
        try {
        let accounts = await axios.get('http://localhost:5000/api/finance');
        this.setState( accounts );
        } catch {
        };
    }

    componentDidMount() {
    };

    render() { 
        return (
            <form className="form-inline">
                <label className="my-1 mr-2" for="inlineFormCustomSelectPref">From:</label>
                <select className="custom-select my-1 mr-sm-2" id="inlineFormCustomSelectPref">
                    <option selected>Choose Witdrawl Account...</option>
                    <option value="1">One</option>
                    <option value="2">Two</option>
                    <option value="3">Three</option>
                </select>

                <label className="my-1 mr-2" for="inlineFormCustomSelectPref">To:</label>
                <select className="custom-select my-1 mr-sm-2" id="inlineFormCustomSelectPref">
                    <option selected>Choose Deposit Account...</option>
                    <option value="1">One</option>
                    <option value="2">Two</option>
                    <option value="3">Three</option>
                </select>

                <label className="sr-only" for="inlineFormInputGroupAmount">Username</label>
                <div className="input-group my-1 mr-sm-2">
                    <div className="input-group-prepend">
                    <div className="input-group-text"><FontAwesomeIcon icon={faMoneyBillAlt} /> $M</div>
                    </div>
                    <input type="text" className="form-control" id="inlineFormInputGroupAmount" placeholder="Amount" />
                </div>

                <button type="submit" className="btn btn-primary my-1">Submit</button>
            </form>
        );
    }
}
 
export default TransferForm;