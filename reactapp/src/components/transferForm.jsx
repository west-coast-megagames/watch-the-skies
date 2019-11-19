import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBillAlt } from '@fortawesome/free-solid-svg-icons';
import { banking } from '../api';

class TransferForm extends Component {
    state = {
        accounts: [],
        transfer: { to: '', from: '', amount: 0, note: '', teamID: '5dc3ba7d79f57e32c40bf6b4'},
    }

    constructor(props) {
        super(props);
        
        banking.accountsUpdate(async (err, data) => {
            let accounts = data;
            this.setState({ accounts });
        });
    };

    handleSubmit = e => {
        e.preventDefault();
        // Validate
        banking.bankingTransfer(this.state.transfer);
        console.log('Submitted');
        banking.updateAccounts(this.state.transfer.teamID);
    };

    handleChange = ({currentTarget: input}) => {
        console.log(`Input Value: ${input.value}`);
        const transfer = {...this.state.transfer};
        transfer[input.name] = input.value;
        this.setState({ transfer })
    };

    componentDidMount() {
        banking.updateAccounts(this.state.transfer.teamID);
    };

    render() {
        let accounts = this.state.accounts;

        return (
            <form className="form-inline" onSubmit={this.handleSubmit}>
                <label className="my-1 mr-2" htmlFor="from">From:</label>
                <select className="custom-select my-1 mr-sm-2" id="from" name='from' value={this.state.transfer.from} onChange={this.handleChange}>
                    <option>Choose Witdrawl Account...</option>
                    { accounts.map(account => (
                        <option 
                            key={account._id}
                            value={account.name}
                        >{ account.name } | $M{ account.balance }</option>
                    ))}
                </select>

                <label className="my-1 mr-2" htmlFor="to" value={this.state.transfer.to}>To:</label>
                <select className="custom-select my-1 mr-sm-2" name="to" id="inlineFormCustomSelectPref" onChange={this.handleChange}>
                    <option>Choose Deposit Account...</option>
                    { accounts.map(account => (
                        <option
                            key={account._id}
                            value={account.name}
                        >{ account.name } | $M{ account.balance }</option>
                    ))}
                </select>

                <div className="input-group my-1 mr-sm-2">
                    <div className="input-group-prepend">
                    <div className="input-group-text"><FontAwesomeIcon icon={faMoneyBillAlt} /> $M</div>
                    </div>
                    <input type="number" className="form-control" id="amount" name="amount" placeholder="Amount" value={this.state.transfer.amount} onChange={this.handleChange}/>
                </div>

                <div className="input-group my-1 mr-sm-2">
                    <div className="input-group-prepend">
                    <div className="input-group-text">Transfer Note:</div>
                    </div>
                    <input type="text" className="form-control" id="note" name="note" placeholder="Reason for transfer" value={this.state.transfer.note} onChange={this.handleChange}/>
                </div>



                <button type="submit" className="btn btn-primary my-1">Submit</button>
            </form>
        );
    }
}
 
export default TransferForm;