import React, { Component } from 'react';
import { Form, FormGroup, Input, InputNumber, Button } from 'rsuite';
import { banking } from '../api';
import Select from './common/selectPicker';

class TransferForm extends Component {
    state = {
        transfer: { to: '', from: '', amount: 0, note: '' },
        account: {},
        schedule: false
    }

    handleSubmit = e => {
        e.preventDefault();
        // Validate
        if (this.state.schedule === false) {
            banking.bankingTransfer(this.state.transfer);
            console.log('Submitted transfer');
        } else {
            banking.autoTransfer(this.state.transfer);
            console.log('Submitted automatic transfer');
        }
        this.props.alert({type: 'success', title: 'Submitted Transfer', body: `Placeholder notification for your transfer of ${this.state.transfer.amount}`})
        let transfer = { to: '', from: '', amount: 0, note: '' };
        let account = {};
        this.setState({ transfer, account });
    };

    handleChange = (value, id) => {
        if (id === 'from') {
            let accountIndex = this.props.accounts.findIndex((account => account._id === value));
            let account = this.props.accounts[accountIndex];
            this.setState({ account });
        }
        
        console.log(`Input Value: ${value}`);
        const transfer = {...this.state.transfer};
        transfer[id] = value;
        console.log(transfer);
        this.setState({ transfer })
    };

    handleAmount = (value) => {
        if (value < 0 || this.state.account.balance === undefined || this.state.account.balance < 0) {
            value = 0;
        } else if (value > this.state.account.balance) {
            value = this.state.account.balance;
        }

        const transfer = {...this.state.transfer};
        transfer.amount = Math.trunc(value);
        console.log(transfer);
        this.setState({ transfer })
    }

    handleClick = ({currentTarget: input}) => {
        console.log(`Input Value: ${input.value}`);
        let schedule = this.state.schedule;
        input.value === 'true' ? schedule = true : schedule = false 
        this.setState({ schedule })
    };

    componentDidMount() {
        let transfer = { to: '', from: '', amount: 0, note: '' }
        this.setState({ transfer });
    }

    render() {
        let accounts = this.props.accounts;
        let max = this.state.account.balance !== undefined ? this.state.account.balance : 0;
        
        if (this.props.accounts.length <= 0)
        return <h4>No accounts available for transfer, select a team to use the application!</h4>

        return (
            <Form layout="inline">
                <Select
                    id='from'
                    data={accounts}
                    width={180}
                    value={this.state.transfer.from}
                    labelKey='name'
                    valueKey='_id'
                    placeholder='withdrawal Account...'
                    handleChange={this.handleChange}
                />
                <Select
                    id='to'
                    data={accounts}
                    width={180}
                    value={this.state.transfer.to}
                    labelKey='name'
                    valueKey='_id'
                    placeholder='Deposit Account...'
                    handleChange={this.handleChange}
                />
                
                <FormGroup>
                    <InputNumber prefix="$M" id="amount" max={ max } min={0} value={this.state.transfer.amount} onChange={this.handleAmount} step={1} style={{ width: 120 }}/>
                </FormGroup>

                <FormGroup>
                    <Input style={{ width: 150 }} placeholder="Note" type="text" id='note' value={this.state.transfer.note} onChange={(value) => this.handleChange(value, 'note')}/>
                </FormGroup>

                <Button onClick={this.handleSubmit}>Submit</Button>
            </Form>

            // <form className="form-inline" onSubmit={this.handleSubmit}>
            //     <label className="my-1 mr-2" htmlFor="from">From:</label>
            //     <select className="custom-select my-1 mr-sm-2" id="from" name='from' value={this.state.transfer.from} onChange={this.handleChange}>
            //         <option>Choose Witdrawl Account...</option>
            //         { accounts.map(account => (
            //             <option 
            //                 key={account._id}
            //                 value={account._id}
            //             >{ account.name } | $M{ account.balance }</option>
            //         ))}
            //     </select>

            //     <label className="my-1 mr-2" htmlFor="to" value={this.state.transfer.to}>To:</label>
            //     <select className="custom-select my-1 mr-sm-2" id="to" name="to" value={this.state.transfer.to} onChange={this.handleChange}>
            //         <option>Choose Deposit Account...</option>
            //         { accounts.map(account => (
            //             <option
            //                 key={account._id}
            //                 value={account._id}
            //             >{ account.name } | $M{ account.balance }</option>
            //         ))}
            //     </select>

            //     <div style={{ width: 120 }}>
                    
            //         {/* <input type="number" className="form-control" id="amount" name="amount" placeholder="Amount" value={this.state.transfer.amount} onChange={this.handleChange}/> */}
            //     </div>

            //     <div className="input-group my-1 mr-sm-2">
            //         <div className="input-group-prepend">
            //         <div className="input-group-text">Transfer Note:</div>
            //         </div>
            //         <input type="text" className="form-control" id="note" name="note" placeholder="Reason for transfer" value={this.state.transfer.note} onChange={this.handleChange}/>
            //     </div>

            //     <div className="form-check mb-2 mr-sm-2">
            //         <input className="form-check-input" type="checkbox" id="schedule" name="schedule" value={!this.state.schedule} onClick={this.handleClick}/>
            //         <label className="form-check-label" htmlFor="inlineFormCheck" >
            //         Schedule
            //         </label>
            //     </div>

            //     <button type="submit" className="btn btn-primary my-1">Submit</button>
            // </form>
        );
    }
}
 
export default TransferForm;