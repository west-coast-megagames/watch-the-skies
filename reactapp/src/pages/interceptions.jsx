import React from 'react';
import Interceptors from '../components/interceptorsTable';
import Contacts from '../components/contactsTable';

const Interception = () => {
    return (
        <React.Fragment>
            <h1>Operations Module - Interception Tab</h1>
            <Contacts />
            <hr />
            <Interceptors />
        </React.Fragment>
    );
}
 
export default Interception;