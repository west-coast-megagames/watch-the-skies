import React, { Component } from 'react';

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
        let transfers = this.state.transfers;
        transfers = [];
    
        for (let account of this.props.accounts) {
            console.log(account)
            for (let transfer of account.autoTransfers) {
                if (!this.state.transfers.find( t => t._id === transfer._id)) {
                    transfer.to = this.props.accounts.find(account => account._id === transfer.to).name;
                    transfer.from = this.props.accounts.find(account => account._id === transfer.from).name;
                    transfers.push(transfer);
                }
            }
        }
        this.setState({ transfers })
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
                            <td><button onClick={ () => console.log(`Deleting ${transfer._id}`) } className="btn btn-danger btn-sm disabled">Cancel</button></td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </React.Fragment>
        );
    }

}

export default AutoTransfers;
