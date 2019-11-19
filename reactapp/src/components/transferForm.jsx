import axios from 'axios';
import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBillAlt } from '@fortawesome/free-solid-svg-icons';

class TransferForm extends Component {
    state = {
        accounts: [
        ],
        teamID: "5dc3ba7d79f57e32c40bf6b4"
    }

// async getAccounts(team) {
//     let accounts = this.state.accounts;
//     try {
//         let finances = await axios.get('http://localhost:5000/api/finances/current/', {
//             params: {
//               id: team
//             }
//           });
//         console.log(finances);
//         accounts = [...finances.accounts]
//         this.setState(accounts);
//     } catch (err) {
//         console.log('Error:', err.message);
//     }
// }

// componentDidMount() {
//     this.getAccounts(this.state.teamID);
// };

    render() {
        let accounts = this.state.accounts;

        return (
            <form className="form-inline">
                <label className="my-1 mr-2" for="inlineFormCustomSelectPref">From:</label>
                <select className="custom-select my-1 mr-sm-2" id="inlineFormCustomSelectPref">
                    <option selected>Choose Witdrawl Account...</option>
                    { accounts.map(account => (
                        <option key={account.id} value={account.name}>{ account.name }</option>
                    ))}
                </select>

                <label className="my-1 mr-2" for="inlineFormCustomSelectPref">To:</label>
                <select className="custom-select my-1 mr-sm-2" id="inlineFormCustomSelectPref">
                    <option selected>Choose Deposit Account...</option>
                    { accounts.map(account => (
                        <option key={account.id} value={account.name}>{ account.name }</option>
                    ))}
                </select>

                <label className="sr-only" for="inlineFormInputGroupAmount">Username</label>
                <div className="input-group my-1 mr-sm-2">
                    <div className="input-group-prepend">
                    <div className="input-group-text"><FontAwesomeIcon icon={faMoneyBillAlt} /> $M</div>
                    </div>
                    <input type="text" className="form-control" id="inlineFormInputGroupAmount" placeholder="Amount" />
                </div>

                <button type="submit" className="btn btn-primary my-1">Submit</button>
            </form>
        );
    }
}
 
export default TransferForm;