import React, { Component } from 'react';
import { Table } from 'rsuite';
const { Column, HeaderCell, Cell } = Table;

class AccountsTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
          data: this.props.accounts
        };
      }

    render() {
        let total = 0;
        this.state.data.forEach(account => {
            total += account.balance;
        });
        if (!this.props.accounts) {
            return(
                <div>
                    <p>No accounts</p>
                </div>
            );
        };

        return (
            <Table
                width={180}
                hover={true}
                autoHeight={true}
                data={this.props.accounts}
                defaultSortType="desc"
            >
                <Column sortable={true} width={100}>
                    <HeaderCell>Account</HeaderCell>
                    <Cell dataKey="name" />
                </Column>
                <Column align="center" width={60}>
                    <HeaderCell title="Total" summary={total}>Total</HeaderCell>
                    <Cell dataKey="balance" />
                </Column>
            </Table>
        );
    }
}
 
export default AccountsTable;

// import { MDBTable, MDBTableBody, MDBTableHead } from 'mdbreact';

// const accountsTable = (props) => {
//     if (!props.accounts) {
//         return(
//             <div>
//                 <p>No accounts</p>
//             </div>
//         );
//     };

//     return (
//         <MDBTable>
//             <MDBTableHead>
//                 <tr>
//                     <th></th>
//                     <th>Total</th>
//                 </tr>
//             </MDBTableHead>
//             <MDBTableBody>
//                 { props.accounts.map(account => (
//                     <tr key={ account._id }>
//                         <td>{ account.name }</td>
//                         <td>$M { account.balance }</td>
//                     </tr>
//                 ))}
//             </MDBTableBody>
//         </MDBTable>
//     );
// }

// export default accountsTable;