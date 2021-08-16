import React, { useEffect } from 'react';
import { Table, Loader, ButtonGroup, Button, ButtonToolbar } from 'rsuite';
const { Column, HeaderCell, Cell } = Table;

const AccountsTable = (props) => {
	const [accounts, setAccounts] = React.useState([]);
	const [total, setTotal] = React.useState(0);

	useEffect(() => {
		const accounts = []
		let newTotal = 0;
		for (let account of props.accounts) {
			let type = account.resources.find(el => el.type === props.resource);
			let balance = type ? type.balance : 0
			accounts.push({name: account.name, balance })
			newTotal += balance;
		}
		setAccounts(accounts);
		setTotal(newTotal);
	}, [props.accounts, props.resource]);


	if (accounts.length < 1) {
		return(
			<Loader backdrop content="No accounts Loaded..." vertical />
			);
	};

	return (
		<div>
			<Table
				width={260}
				hover={true}
				autoHeight={true}
				data={accounts}
				defaultSortType="desc"
			>
				<Column sortable={true} width={140}>
						<HeaderCell>Account</HeaderCell>
						<Cell dataKey="name" />
				</Column>
				<Column align="center" width={100}>
						<HeaderCell title="Total" summary={total}>Total ({total})</HeaderCell>
						<Cell dataKey="balance" />
				</Column>
			</Table>
		</div>
	);
};

export default AccountsTable;