import React, {Component} from 'react'; // React import
import TransferForm from '../../../components/transferForm';
import ChartsPage from '../../../components/graph';
import AccountsTable from '../../../components/accountsTable'
import AutoTransfers from '../../../components/transfersTable';
import { Container, Header, Content, Footer, Sidebar, SelectPicker } from 'rsuite';

class Budget extends Component {
    state = {
        account: undefined,
        account_id: null
    }

    componentDidMount() {
        let accountIndex = this.props.accounts.findIndex(account => account.name === 'Treasury');
        let account = this.props.accounts[accountIndex];
        let account_id = account._id;
        this.setState({ account, account_id })
    }

    handleChange = (value) => {
        let accountIndex = this.props.accounts.findIndex(account => account._id === value);
        let account = this.props.accounts[accountIndex];
        let account_id = value;
        this.setState({ account, account_id })
    }

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
                        <SelectPicker
                            width={180}
                            searchable={false}
                            cleanable={false}
                            data={ this.props.accounts } 
                            value={ this.state.account_id }
                            placeholder='Select account for graph'
                            onChange={this.handleChange}
                            valueKey='_id'
                            labelKey='name'
                        />
                    </Sidebar>
                    <Content>
                        <ChartsPage { ...this.props }
                            account={ this.state.account }    
                        />
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