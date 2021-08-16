import React, { useEffect } from 'react';
import { Table, Loader } from 'rsuite';
const { Column, HeaderCell, Cell } = Table;

const AccountsTable = (props) => {
	const [accounts, setAccounts] = React.useState([]);
	const [total, setTotal] = React.useState(0);

	useEffect(() => {
		const accounts = []
		let newTotal = 0;
		for (let account of props.accounts) {
			let resource = account.resources.find(el => el.type === 'Megabucks');
			accounts.push({name: account.name, balance: resource.balance})
			newTotal += resource.balance;
		}
		setAccounts(accounts);
		setTotal(newTotal);
	}, [props.accounts]);


	if (accounts.length < 1) {
		return(
			<Loader backdrop content="No accounts Loaded..." vertical />
			);
	};

	return (
		<Table
			width={260}
			hover={true}
			autoHeight={true}
			data={accounts}
			defaultSortType="desc"
		>
			<Column sortable={true} width={160}>
					<HeaderCell>Account</HeaderCell>
					<Cell dataKey="name" />
			</Column>
			<Column align="center" width={80}>
					<HeaderCell title="Total" summary={total}>Total ({total})</HeaderCell>
					<Cell dataKey="balance" />
			</Column>
		</Table>
	);
};

export default AccountsTable;