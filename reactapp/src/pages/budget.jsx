import React from 'react'; // React import
import TransferForm from '../components/transferForm';
import ChartsPage from '../components/graph';

const Budget = (props) => {
    return (
        <React.Fragment>
            <h1>Governance Module - Budget Tab</h1>
            <TransferForm
                team={props.team}
            />
            <ChartsPage
                team={props.team}
            />
        </React.Fragment>
    );
}
 
export default Budget;