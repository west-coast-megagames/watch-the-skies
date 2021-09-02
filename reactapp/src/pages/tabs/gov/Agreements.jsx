import React, { useEffect } from 'react'; // React import
import { connect } from 'react-redux'; // Redux store provider
import { Container, Content, Loader, Sidebar, SelectPicker, Button, Modal, ButtonGroup, Table, FlexboxGrid, IconButton, Icon, Alert } from 'rsuite';
import { getTreasuryAccount, getAccountsForTeam } from '../../../store/entities/accounts';
import AccountGraph from '../../../components/common/GraphAccounts';
import  socket  from '../../../socket';
import { getNational } from '../../../store/entities/teams';

const { HeaderCell, Cell, Column, } = Table;

const Agreements = (props) => {
	const [account, setAccount] = React.useState(props.account); // The currently selected account
	const [type, setType] = React.useState('Megabucks'); // The currently selected resource
	const [resourceList, setResourceList] = React.useState([{ value: 'Megabucks', label: 'Megabucks' }, { value: 'Red Murcury', label: 'Red Murcury' }]); // List of resources
	const [options, setOptions] = React.useState([]); // The selection options
	const [transactions, setTransactions] = React.useState([]); // Transactions to be pushed


	useEffect(() => {

	}, [])

	const handleChange = (value) => {
		let accountIndex = props.accounts.findIndex(account => account._id === value);
		setAccount(props.accounts[accountIndex]);
	};

	const handleIt = () => {
		let data = {

		}
		socket.emit('request', { route: 'governance', action: 'treaty', data});
	}

	// TODO John Review if AutoTransfers needs to be updated for account.autoTransfer change to account.queue
	return (
		/* [- Budget Tab -]
			DESC: Designed to allow for a user to transfer resources between accounts and see the current amounts
		*/
		<Container className="budget-tab">
			<Table 
			style={{ textAlign: 'center' }}
          rowKey='_id'
					height={document.documentElement.clientHeight * 0.80}
          data={ props.natTeams }
      >
      <Column  flexGrow={2}>
          <HeaderCell>Nation</HeaderCell>
          <Cell style={{ textAlign: 'left' }} dataKey='name' />
      </Column>



      </Table>
			<ButtonGroup>
				<Button onClick={()=> handleIt()} >Test</Button>
			</ButtonGroup>
		</Container>
	);
}

const mapStateToProps = state => ({
	team: state.auth.team,
	natTeams: getNational(state)
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Agreements);