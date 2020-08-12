import React, { Component } from 'react';
import { Form, FormGroup, Input, InputNumber, ButtonGroup, Button, Alert } from 'rsuite';
import { banking } from '../api';
import Select from './common/selectPicker';
import notify from '../scripts/notify';

class TransferForm extends Component {
    state = {
        transfer: {
            to: null,
            from: null
        },
        account: {},
        schedule: false
    }

    handleSubmit = e => {
        e.preventDefault();
        // Validate
        if (this.state.transfer.to === undefined || this.state.transfer.from === undefined){
            notify({catagory: 'error', type: 'error', title: 'Transfer failed', body: `Accounts not selected`})
        } else if (this.state.transfer.amount < 1) {
            Alert.warning(`You tried to send a transfer for 0, shame on you...`, 4000);
        } else {
            if (this.state.transfer.schedule === true) {
                banking.autoTransfer(this.state.transfer);
                console.log('Submitted automatic transfer');
            } else {
                banking.bankingTransfer(this.state.transfer);
                console.log('Submitted transfer');
            }
            notify({catagory: 'action',type: 'success', title: 'Submitted Transfer', body: `Placeholder notification for your transfer of ${this.state.transfer.amount}`})
            this.props.delTransfer(this.state.transfer.id);
        }
    };

    handleChange = (value, id) => {
        let transfer = {...this.state.transfer};
        if (id === 'from') {
            let accountIndex = this.props.accounts.findIndex((account => account._id === value));
            let account = this.props.accounts[accountIndex];
            transfer.amount = 0
            this.setState({ account });
        }

        console.log(`Input Value: ${value}`);
        transfer[id] = value;
        console.log(transfer);
        this.setState({ transfer })
    };

    handleAmount = (value) => {
        if (value < 0 || this.state.account === undefined || this.state.account.balance < 0) {
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
        let transfer = this.props.transfer;
        this.setState({ transfer, accounts: this.props.accounts });
    }

    render() {
        let accounts = this.props.accounts;
        let max = this.state.account !== undefined ? this.state.account.balance : 0;
        let { schedule } = this.state.transfer
        
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

                <ButtonGroup><Button onClick={this.handleSubmit}>{schedule === true ? "Submit Scheduled Transfer" : "Submit Transfer"}</Button><Button onClick={() => this.props.delTransfer(this.props.transfer.id)} color="red">X</Button></ButtonGroup>
            </Form>
        );
    }
}
 
export default TransferForm;