import React, {Component} from 'react'; // React import
import TransferForm from '../../../components/transferForm';
import ChartsPage from '../../../components/graph';
import AccountsTable from '../../../components/accountsTable'
import AutoTransfers from '../../../components/transfersTable';
import { Container, Header, Content, Footer, Sidebar } from 'rsuite';

class Budget extends Component {
    state = { account: {}}
    render() { 
        return (
            <Container className="budget-tab">
                <Header className="transfers">
                    <TransferForm {...this.props}
                    />
                </Header>
                <Container className="transfers">
                    <Sidebar>
                        <AccountsTable accounts={ this.props.accounts } />
                    </Sidebar>
                    <Content>
                        <ChartsPage {...this.props} />
                    </Content>
                </Container>
                <Footer>
                    <h4>Automatic Transfers</h4>
                    <AutoTransfers accounts={ this.props.accounts } />
                </Footer>
            </Container>
        );
    }
}
 
export default Budget;