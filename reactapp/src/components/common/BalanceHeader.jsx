import React, { Component } from 'react';
import { Tag, Affix } from 'rsuite';


// Function which prints a header with an optional title and the balance summary of an account at the top right of the page
//
// REQUIRES PROPS:
// accounts: 	array of accounts with unique field 'code' for each account
// code:		the code which matches the account to seek the balance of
// title:		A string title to place in the header on the left of page

const BalanceHeader = (props) => {
	// Look up the code within the accounts array
	let account = props.accounts.filter(el => el.code === props.code);

	// Do nothing yet if accounts has not been setup.  Else, save the account
	if (account.length !== 0) {
		account = account[0];
	}

	return(
		<div>
			<Affix>
				<h5 style={{display: 'inline'}}>{props.title}</h5>
				<Tag style={{display: 'inline', float: 'right'}} color="green">$ { account.balance } MB</Tag>
				<h6 style={{display: 'inline', float: 'right', padding: '0 15px 0 0' }} >Current { props.code } Account Balance:</h6>
				<hr />
			</Affix>
		</div>
	);
}

export default BalanceHeader;

