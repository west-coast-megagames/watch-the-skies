import React from 'react';
import BasicRange from '../components/common/basicRange'
import TransferForm from '../components/transferForm';

const Budget = () => {
    return (
        <React.Fragment>
            <h1>Governance Module - Budget Tab</h1>
            {/*<BasicRange />*/}
            <TransferForm />
        </React.Fragment>
    );
}
 
export default Budget;