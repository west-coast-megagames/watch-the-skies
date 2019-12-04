import React from 'react';
import { MDBTable, MDBTableBody, MDBTableHead } from 'mdbreact';

const accountsTable = (props) => {
    if (!props.accounts) {
        return(
            <div>
                <p>No accounts</p>
            </div>
        );
    };

    return (
        <MDBTable>
            <MDBTableHead>
                <tr>
                    <th>Account</th>
                    <th>Total</th>
                </tr>
            </MDBTableHead>
            <MDBTableBody>
                { props.accounts.map(account => (
                    <tr key={ account._id }>
                        <td>{ account.name }</td>
                        <td>{ account.balance }</td>
                    </tr>
                ))}
            </MDBTableBody>
        </MDBTable>
    );
}

export default accountsTable;