import React, { useEffect } from 'react';
import { Table, Loader, ButtonGroup, Button, ButtonToolbar } from 'rsuite';
import TeamAvatar from "../components/common/teamAvatar";
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
			accounts.push({name: account.name, balance, team: account.team.code })
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
				height={500}
				hover={true}
				virtualized
				data={accounts}
				rowKey='_id'
				defaultSortType="desc"
			>
				{props.control && <Column width={50}>
						<HeaderCell>Team</HeaderCell>
						<Cell>
							{rowData => {
          	  let { team } = rowData;
          	  return (
								<TeamAvatar size={'sm'} code={team} /> 
          	  )
          		}}   
						</Cell>
				</Column>}
				<Column sortable={true} flexGrow={1}>
						<HeaderCell>Account</HeaderCell>
						<Cell dataKey="name" />
				</Column>
				<Column align="center" flexGrow={1}>
						<HeaderCell title="Total" summary={total}>Total ({total})</HeaderCell>
						<Cell dataKey="balance" />
				</Column>
			</Table>
		</div>
	);
};

export default AccountsTable;