import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBillAlt } from '@fortawesome/free-solid-svg-icons';
import { banking, teamEvents } from '../api';

class TransferForm extends Component {
    state = {
        transfer: { to: '', from: '', amount: 0, note: '', teamID: this.props.team._id},
        schedule: false
    }

    handleSubmit = e => {
        e.preventDefault();
        // Validate
        if (this.state.schedule === false) {
            banking.bankingTransfer(this.state.transfer);
            console.log('Submitted transfer');
            teamEvents.updateTeam(this.props.team._id);
        } else {
            banking.autoTransfer(this.state.transfer);
            console.log('Submitted automatic transfer');
            teamEvents.updateTeam(this.props.team._id);
        }
        let transfer = { to: '', from: '', amount: 0, note: '', teamID: this.props.team._id}
        this.setState({ transfer });
    };

    handleChange = ({currentTarget: input}) => {
        console.log(`Input Value: ${input.value}`);
        const transfer = {...this.state.transfer};
        transfer[input.name] = input.value;
        this.setState({ transfer })
    };

    handleClick = ({currentTarget: input}) => {
        console.log(`Input Value: ${input.value}`);
        let schedule = this.state.schedule;
        input.value === 'true' ? schedule = true : schedule = false 
        this.setState({ schedule })
    };

    render() {
        let accounts = this.props.team.accounts;
        
        if (this.props.team.name === "Select Team")
        return <h4>No accounts availible for transfer, select a team to use the application!</h4>

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
                <select className="custom-select my-1 mr-sm-2" name="to" id="to" value={this.state.transfer.to} onChange={this.handleChange}>
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

                <div className="form-check mb-2 mr-sm-2">
                    <input className="form-check-input" type="checkbox" id="schedule" name="schedule" value={!this.state.schedule} onClick={this.handleClick}/>
                    <label className="form-check-label" htmlFor="inlineFormCheck" >
                    Schedule
                    </label>
                </div>

                <button type="submit" className="btn btn-primary my-1">Submit</button>
            </form>
        );
    }
}
 
export default TransferForm;