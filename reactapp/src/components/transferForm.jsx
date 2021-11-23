import React, { Component } from 'react';
import { Form, FormGroup, Input, InputNumber, ButtonGroup, Button, Alert, Modal, ControlLabel } from 'rsuite';
import { banking } from '../api';
import socket from '../socket';
import Select from './common/selectPicker';
import notify from '../scripts/notify';

const formatPickerData = (accounts, type) => {
	let data = [];
	
	for (let account of accounts) {
		let wallet = account.resources.find(el => el.type === type);
		let option = {
			_id: account._id,
			name: `${account.team.code} | ${account.name} | Balance: ${wallet ? wallet.balance : 'N/A'}`
		}
			data.push(option);
	}
	return data;
}

class TransferForm extends Component {
	state = {
		transfer: {
			to: null,
			from: null,
			resource: 'Megabucks',
			account: {},
			schedule: false
		}
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
				socket.emit('request', { route: 'transaction', action: 'transfer', data: this.state.transfer });
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
		// console.log(transfer);
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
		// console.log(transfer);
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
			let accounts = formatPickerData(this.props.accounts, this.props.transfer.resource);
			let max = this.state.account !== undefined ? this.state.account.balance : 0;
			let { schedule } = this.state.transfer
			
			if (this.props.accounts.length <= 0)
			return <h4>No accounts available for transfer, select a team to use the application!</h4>

		return (
			<Form fluid>
				<Modal.Header>
					<Modal.Title>{schedule === true ? "Scheduled Transfer Form" : "Immediate Transfer Form"}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p><b>Resource:</b> {this.props.transfer.resource}</p>
					<Select
						id='from'
						data={accounts}
						value={this.state.transfer.from}
						labelKey='name'
						valueKey='_id'
						placeholder='Withdrawal Account...'
						handleChange={this.handleChange}
					/>
					<Select
						id='to'
						data={accounts}
						value={this.state.transfer.to}
						labelKey='name'
						valueKey='_id'
						placeholder='Deposit Account...'
						handleChange={this.handleChange}
					/>
					<br />
					<FormGroup>
						<ControlLabel>Amount to tranfer</ControlLabel>
						<InputNumber  prefix="$M" id="amount" max={ max } min={0} value={this.state.transfer.amount} onChange={this.handleAmount} step={1} />
					</FormGroup>
					<FormGroup>
						<ControlLabel>Transfer note</ControlLabel>
						<Input placeholder="Note" type="text" id='note' value={this.state.transfer.note} onChange={(value) => this.handleChange(value, 'note')}/>
					</FormGroup>
				</Modal.Body>
				<Modal.Footer>
					<ButtonGroup style={{float: 'right'}}>
						<Button onClick={this.handleSubmit}>{schedule === true ? "Submit Scheduled Transfer" : "Submit Transfer"}</Button>
						<Button onClick={() => this.props.delTransfer(this.props.transfer.id)} color="red">X</Button>
					</ButtonGroup>
				</Modal.Footer>  
			</Form>
		);
	}
}

export default TransferForm;