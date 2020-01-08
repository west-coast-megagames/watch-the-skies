import React, { Component } from 'react';
import axios from 'axios';

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
        let transfers = [];
    
        for (let account of this.props.accounts) {
            console.log(account)
            for (let transfer of account.autoTransfers) {
                if (transfer !== null && !this.state.transfers.find( t => t._id === transfer._id)) {
                    let toAccount = this.props.accounts.find(account => account._id === transfer.to);
                    transfer.to = toAccount.name;
                    let fromAccount = this.props.accounts.find(account => account._id === transfer.from);
                    transfer.from = fromAccount.name;
                    transfers.push(transfer);
                }
            }
        }
        this.setState({ transfers })
    }

    cancelTransfer = async (transfer) => {
        let accounts = this.props.accounts;
        let indexOf = accounts.findIndex((account => account.name === transfer.from));
        let account = accounts[indexOf];

        let request = { account_id: account._id , transfer_id: transfer._id }
        console.log(transfer);
        console.log(request);
        await axios.put('https://project-nexus-prototype.herokuapp.com/api/banking/transfer', request);
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
                            <td>{ transfer.from }</td>
                            <td>{ transfer.to }</td>
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
