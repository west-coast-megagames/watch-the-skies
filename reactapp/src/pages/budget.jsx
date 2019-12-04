import React from 'react'; // React import
import TransferForm from '../components/transferForm';
import ChartsPage from '../components/graph';
import AccountsTable from '../components/accountsTable'
import { MDBContainer, MDBRow, MDBCol } from "mdbreact";

const Budget = (props) => {
    return (
        <MDBContainer fluid>
            <MDBRow>
                <MDBCol>
                    <h1>Governance Module - Budget Tab</h1>
                </MDBCol>
            </MDBRow>
            <MDBRow>
                <MDBCol>
                    <TransferForm
                        team={ props.team }
                    />
                </MDBCol>
            </MDBRow>
            <MDBRow>
                <MDBCol size="2">
                    <AccountsTable accounts={ props.team.accounts } />
                </MDBCol>
                <MDBCol size="5">
                    <ChartsPage
                        team={ props.team }
                    />
                </MDBCol>
            </MDBRow>
        </MDBContainer>
    );
}
 
export default Budget;