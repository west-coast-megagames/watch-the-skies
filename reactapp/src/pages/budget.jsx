import React from 'react'; // React import
import TransferForm from '../components/transferForm';
import ChartsPage from '../components/graph';
import AccountsTable from '../components/accountsTable'
import AutoTransfers from './../components/transfersTable';
import { Container, Header, Content, Footer, Sidebar } from 'rsuite';

const Budget = (props) => {
    return (
        <Container className="budget-tab">
            <Header className="transfers">
                <TransferForm
                    team={ props.team }
                    accounts={ props.accounts }
                    handleUpdate={ props.handleUpdate }
                    alert={ props.alert }
                />
            </Header>
            <Container className="transfers">
                <Sidebar>
                    <AccountsTable accounts={ props.accounts } />
                </Sidebar>
                <Content>
                    <ChartsPage
                        team ={ props.team }
                        accounts={ props.accounts }
                    />
                </Content>
            </Container>
            <Footer>
                <h4>Automatic Transfers</h4>
                <AutoTransfers
                        accounts={ props.accounts }
                />
            </Footer>
        </Container>
    );
}
 
export default Budget;