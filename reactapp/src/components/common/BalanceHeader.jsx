import React from 'react';
import { Tag, Affix, Loader } from 'rsuite';


// Function which prints a header with an optional title and the balance summary of an account at the top right of the page
//
// REQUIRES PROPS:
// accounts: 	array of accounts with unique field 'code' for each account
// code:		the code which matches the account to seek the balance of
// title:		A string title to place in the header on the left of page

const BalanceHeader = (props) => {
	let account = props.account;

	let color = 'orange';

	if (account === undefined) return (
			<Affix>
				<h5 style={{display: 'inline'}}>{ props.title }</h5>
				<Loader style={{display: 'inline', float: 'right'}} content="No account..." />
			</Affix>
	);

	account.balance < 1 ? color = 'red' : color = 'green';
	return(
		<div>
			<Affix>
				<h5 style={{display: 'inline'}}>{ props.title }</h5>
				<Tag style={{display: 'inline', float: 'right'}} color={ color }>$ { account.balance } MB</Tag>
				<h6 style={{display: 'inline', float: 'right', padding: '0 15px 0 0' }} > { account.name } Balance:</h6>
				<hr />
			</Affix>
		</div>
	);
}

export default BalanceHeader;

