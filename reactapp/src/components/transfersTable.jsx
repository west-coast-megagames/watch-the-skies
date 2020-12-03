import React, { Component } from 'react';
import axios from 'axios';
import { gameServer } from '../config';

class AutoTransfers extends Component {
    state = {
        transfers: []
    }

    componentDidMount() {
        this.updateAuto();
    }

    componentDidUpdate(prevProps) {
        if(prevProps.accounts !== this.props.accounts){
            this.updateAuto();
        }
    }

    updateAuto = () => {
        let accounts = [...this.props.accounts];
        let transfers = [];
    
        for (let account of accounts) {
            // console.log(account)
            for (let transfer of account.autoTransfers) {
                console.log(transfer)
                if (transfer !== null) {
                    let index = this.state.transfers.findIndex( t => t._id === transfer._id);
                    if (index === -1) {
                        transfers.push(transfer);
                    }
                }
            }
        }
        this.setState({ transfers })
    }

    getAccountName = (account_id) => {
        let account = this.props.accounts.find(account => account._id === account_id);
        let name = account.name
        return name
    }

    cancelTransfer = async (transfer) => {
        let accounts = this.props.accounts;
        let indexOf = accounts.findIndex((account => account._id === transfer.from));
        let account = accounts[indexOf];

        let request = { account_id: account._id , transfer_id: transfer._id }
        // console.log(transfer);
        // console.log(request);
        let { data: response } = await axios.patch(`${gameServer}api/banking/delAutoTransfer`, request);
        this.props.alert({type: 'success', title: 'Deleted automatic payment', body: response});
    }

    render() {
        const { length: count } = this.state.transfers;

        if (count === 0)
            return <p>No Automatic Transfers Set-up</p>
        return (
            <React.Fragment>
                <p>Currently {count} Auto-Transfers set</p>
                <table className="table">
                    <thead>
                        <tr>
                            <th>From</th>
                            <th>To</th>
                            <th>Amount</th>
                            <th>Note</th>
                            <th>Cancel</th>
                        </tr>
                    </thead>
                    <tbody>
                    { this.state.transfers.map(transfer => (
                        <tr key={ transfer._id }>
                            <td>{ this.getAccountName(transfer.from) }</td>
                            <td>{ this.getAccountName(transfer.to) }</td>
                            <td>{ transfer.amount }</td>
                            <td>{ transfer.note }</td>
                            <td><button onClick={ () => this.cancelTransfer(transfer) } className="btn btn-danger btn-sm">Cancel</button></td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </React.Fragment>
        );
    }

}

export default AutoTransfers;
