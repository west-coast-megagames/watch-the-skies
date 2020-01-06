import React from 'react'; // React import
import TransferForm from '../components/transferForm';
import ChartsPage from '../components/graph';
import AccountsTable from '../components/accountsTable'
import AutoTransfers from './../components/transfersTable';
import { MDBContainer, MDBRow, MDBCol } from "mdbreact";


const Budget = (props) => {
    return (
        <MDBContainer fluid>
            <MDBRow>
                <MDBCol>
                    <TransferForm
                        team={ props.team }
                        accounts={ props.accounts }
                        handleUpdate={ props.handleUpdate }
                    />
                </MDBCol>
            </MDBRow>
            <MDBRow>
                <MDBCol size="2">
                    <AccountsTable accounts={ props.accounts } />
                </MDBCol>
                <MDBCol size="5">
                    <ChartsPage
                        team ={ props.team }
                        accounts={ props.accounts }
                    />
                </MDBCol>
            </MDBRow>
            <MDBRow>
                <MDBCol>
                    <h4>Automatic Transfers</h4>
                </MDBCol>
            </MDBRow>
            <MDBRow>
                <MDBCol>
                    <AutoTransfers
                        accounts={ props.accounts }
                    />
                </MDBCol>
            </MDBRow>
        </MDBContainer>
    );
}
 
export default Budget;