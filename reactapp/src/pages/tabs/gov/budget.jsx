import React, {Component} from 'react'; // React import
import { connect } from 'react-redux'; // Redux store provider
import TransferForm from '../../../components/transferForm';
import AccountsTable from '../../../components/accountsTable'
import AutoTransfers from '../../../components/transfersTable';
import { Container, Content, Loader, Sidebar, SelectPicker, Button, Modal } from 'rsuite';
import { getTreasuryAccount, getAccountsForTeam } from '../../../store/entities/accounts';
import AccountGraph from '../../../components/common/GraphAccounts';

let count = 0;

const formatPickerData = (accounts) => {
	let data = [];
	for (let account of accounts) {
		let option = {
			_id: account._id,
			label: `${account.name} | Balance: $M${account.resources[0].balance}`
		}
		data.push(option);
	}
  return data;
}

class Budget extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: formatPickerData(this.props.accounts),
			account: this.props.account,
			account_id: this.props.account !== undefined ? this.props.account._id : undefined,
			transactions: []
		}
		this.handleChange = this.handleChange.bind(this);
		this.addTransfer = this.addTransfer.bind(this);
		this.delTransfer = this.delTransfer.bind(this);
	}

	componentDidUpdate(prevProps) {
		if (prevProps.lastFetch !== this.props.lastFetch) {
			let newAccount = this.props.accounts.find(account => account._id === this.state.account_id);
			let data = formatPickerData(this.props.accounts);
			this.setState({ account: newAccount, data });
		}
	}

	handleChange = (value) => {
		let accountIndex = this.props.accounts.findIndex(account => account._id === value);
		let account = this.props.accounts[accountIndex];
		let account_id = value;
		this.setState({ account, account_id })
	};

	addTransfer = (schedule) => {
		let transfer = { id: count, to: undefined, from: undefined, amount: 0, resource:'Megabucks', note: undefined }
		if (schedule === true) transfer.schedule = true;
		let transactions = this.state.transactions;
		transactions.push(transfer)
		this.setState({ transactions })
		count++;
	};

	delTransfer = (id) => {
		let transactions = this.state.transactions;
		let index = transactions.findIndex(el => el.id === id)
		if (transactions.length === 1) {
			transactions = []
		} else {
			transactions.splice(index, 1);
		}
		this.setState({ transactions })
	}

	render() {
		if (!this.props.account) {
			return(<Loader center content="No accounts Loaded..." vertical />);
		};

		return (
			<Container className="budget-tab">
				<Container className="transfers">
					<Content>
						<h4>{this.state.account.name} Account</h4>
						{/* <AccountGraph
							account={this.state.account}
						/> */}
						<h4>Automatic Transfers</h4>
						<AutoTransfers
							accounts={ this.props.accounts }
							Alert={ this.props.alert }
						/>
					</Content>
						<Sidebar>
							<SelectPicker
								block
								style={{paddingBottom: '5px'}}
								searchable={false}
								cleanable={false}
								data={ this.state.data } 
								value={ this.state.account_id }
								placeholder='Select account for graph'
								onChange={this.handleChange}
								valueKey='_id'
							/>
							<Button block onClick={() => this.addTransfer(false)}>New Transfer</Button>
							<Button block onClick={() => this.addTransfer(true)}>Set Automatic Transfer</Button>
							<AccountsTable accounts={ this.props.accounts } />
						</Sidebar>
					</Container>
					{this.state.transactions.map(el => (
						<Modal show={this.state.transactions.length > 0} size='xs' onHide={() => this.delTransfer(el.id)}>
						<TransferForm key={el.id} transfer={el} delTransfer={this.delTransfer} {...this.props} />
						</Modal>
					))}
			</Container>
		);
	}
}

const mapStateToProps = state => ({
	login: state.auth.login,
	accounts: getAccountsForTeam(state),
	account: getTreasuryAccount(state),
	lastFetch: state.entities.accounts.lastFetch
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Budget);