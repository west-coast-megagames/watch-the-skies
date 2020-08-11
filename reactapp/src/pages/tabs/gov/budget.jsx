import React, {Component} from 'react'; // React import
import { connect } from 'react-redux'; // Redux store provider
import TransferForm from '../../../components/transferForm';
import ChartsPage from '../../../components/graph';
import AccountsTable from '../../../components/accountsTable'
import AutoTransfers from '../../../components/transfersTable';
import { Container, Header, Content, Footer, Sidebar, SelectPicker, ButtonGroup, Button } from 'rsuite';
import { getTreasuryAccount, getAccountsForTeam } from '../../../store/entities/accounts';

let count = 0;

class Budget extends Component {
    constructor(props) {
        super(props);
        this.state = {
            account: this.props.account,
            account_id: this.props.account._id,
            transactions: []
        }
        this.handleChange = this.handleChange.bind(this);
        this.addTransfer = this.addTransfer.bind(this);
        this.delTransfer = this.delTransfer.bind(this);
    }

    handleChange = (value) => {
        let accountIndex = this.props.accounts.findIndex(account => account._id === value);
        let account = this.props.accounts[accountIndex];
        let account_id = value;
        this.setState({ account, account_id })
    };

    addTransfer = (schedule) => {
        let transfer = { id: count, to: undefined, from: undefined, amount: 0, note: undefined }
        if (schedule === true) transfer.schedule = true;
        let transactions = this.state.transactions;
        transactions.push(transfer)
        this.setState({ transactions })
        count++;
    };

    delTransfer = (id) => {
        let transactions = this.state.transactions;
        console.log(transactions)
        let index = transactions.findIndex(el => el.id === id)
        if (transactions.length === 1) {
            transactions = []
        } else {
            transactions.splice(index, 1);
        }
        this.setState({ transactions })
    }

    render() {
        return (
            <Container className="budget-tab">
                <Header className="transfers">
                    <ButtonGroup><Button onClick={() => this.addTransfer(false)}>New Transfer</Button><Button onClick={() => this.addTransfer(true)}>Set Automatic Transfer</Button></ButtonGroup>
                    {this.state.transactions.map(el => (<TransferForm key={el.id} transfer={el} delTransfer={this.delTransfer} {...this.props}
                    />))}
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
                        <ChartsPage
                            account={ {...this.state.account} }  
                        />
                    </Content>
                </Container>
                <Footer>
                    <h4>Automatic Transfers</h4>
                    <AutoTransfers
                        accounts={ this.props.accounts }
                        alert={ this.props.alert }
                    />
                </Footer>
            </Container>
        );
    }
}

const mapStateToProps = state => ({
    login: state.auth.login,
    accounts: getAccountsForTeam(state),
    account: getTreasuryAccount(state)
});
  
const mapDispatchToProps = dispatch => ({});
  
export default connect(mapStateToProps, mapDispatchToProps)(Budget);