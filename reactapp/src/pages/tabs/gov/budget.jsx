import React, { useEffect } from 'react'; // React import
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

const BudgetTab = (props) => {
	const [account, setAccount] = React.useState(props.account); // The currently selected account
	const [type, setType] = React.useState('Megabucks'); // The currently selected resource
	const [resourceList, setResourceList] = React.useState([{ value: 'Megabucks', label: 'Megabucks' }, { value: 'Red Murcury', label: 'Red Murcury' }]); // List of resources
	const [options, setOptions] = React.useState([]); // The selection options
	const [transactions, setTransactions] = React.useState([]); // Transactions to be pushed

	useEffect(() => {
		setOptions(formatPickerData(props.accounts))
		setAccount(props.accounts.find(el => el._id === account._id));
	}, [props.accounts, props.lastFetch, account]);

	useEffect(() => {
		let accountOptions = []
		for (let account of props.accounts) {
			let resource = account.resources.find(el => el.type === type);
			let balance = resource ? resource.balance : 0;
			let option = {
				_id: account._id,
				label: `${account.name} | Balance: $M${balance}`
			}
			accountOptions.push(option);
		}
		setOptions(accountOptions);
	}, [props.accounts, type])

	const handleChange = (value) => {
		let accountIndex = props.accounts.findIndex(account => account._id === value);
		setAccount(props.accounts[accountIndex]);
	};

	const addTransfer = (schedule) => {
		let transfer = { id: count, to: undefined, from: undefined, amount: 0, resource: type, note: undefined }
		if (schedule === true) transfer.schedule = true;
		let list = transactions;
		list.push(transfer);
		setTransactions(list);
		count++;
	};

	const delTransfer = (id) => {
		let list = transactions;
		let index = list.findIndex(el => el.id === id)
		if (list.length === 1) {
			list = []
		} else {
			list.splice(index, 1);
		}
		setTransactions(list);
	}

	if (!props.account) {
		return(<Loader center content="No accounts Loaded..." vertical />);
	};

	// TODO John Review if AutoTransfers needs to be updated for account.autoTransfer change to account.queue
	return (
		<Container className="budget-tab">
			<Container className="transfers">
				<Content>
					<h4>{account.name} Account</h4>
					{/* <AccountGraph
						account={this.state.account}
					/> */}
					<h4>Automatic Transfers</h4>
					<AutoTransfers
						accounts={ props.accounts }
						Alert={ props.alert }
					/>
				</Content>
					<Sidebar>
						<SelectPicker
							block
							style={{paddingBottom: '5px'}}
							searchable={false}
							cleanable={false}
							data={ options } 
							value={ account._id }
							placeholder='Select account for graph'
							onChange={handleChange}
							valueKey='_id'
						/>
						<SelectPicker
							block
							style={{paddingBottom: '5px'}}
							searchable={false}
							cleanable={false}
							data={ resourceList } 
							value={ type }
							placeholder='Select Desired resource'
							onChange={ value => setType(value) }
						/>
						<Button block onClick={() => addTransfer(false)}>New Transfer</Button>
						<Button block onClick={() => addTransfer(true)}>Set Automatic Transfer</Button>
						<AccountsTable accounts={ props.accounts } resource={ type } />
					</Sidebar>
				</Container>
				{transactions.map(el => (
					<Modal show={transactions.length > 0} size='xs' onHide={() => delTransfer(el.id)}>
					<TransferForm key={el.id} transfer={el} delTransfer={delTransfer} {...props} />
					</Modal>
				))}
		</Container>
	);
}

const mapStateToProps = state => ({
	login: state.auth.login,
	accounts: getAccountsForTeam(state),
	account: getTreasuryAccount(state),
	lastFetch: state.entities.accounts.lastFetch
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(BudgetTab);