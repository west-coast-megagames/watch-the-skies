import React, { Component } from 'react';
import { getTransactionLogs } from '../../store/entities/logs';
import { Table } from 'rsuite';
import { connect } from 'react-redux';

const { Column, HeaderCell, Cell, Pagination } = Table;

class TransactionList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            logs: [],
            displayLength: 10,
            loading: false,
            page: 1
        };
        this.handleChangePage = this.handleChangePage.bind(this);
        this.handleChangeLength = this.handleChangeLength.bind(this);
    }
      handleChangePage(dataKey) {
        this.setState({
          page: dataKey
        });
      }

      handleChangeLength(dataKey) {
        this.setState({
          page: 1,
          displayLength: dataKey
        });
      }

    componentDidMount() {
      console.log(this.props.logs)
        this.setState({ logs: this.props.logs })
    }

    getData() {
        const { displayLength, page } = this.state;
        return this.state.logs.filter((v, i) => {
          const start = displayLength * (page - 1);
          const end = start + displayLength;
          return i >= start && i < end;
        });
      }

    render() {
        const data = this.getData();
        const { loading, displayLength, page } = this.state;
    
        return (
          <div>
            <Table autoHeight affixHeader data={data} loading={loading}>
              <Column width={100} align="center" fixed>
                <HeaderCell>Type</HeaderCell>
                <Cell dataKey="transaction" />
              </Column>
    
              <Column width={120} fixed>
                <HeaderCell>Team</HeaderCell>
                <Cell dataKey="team.shortName" />
              </Column>
    
              <Column width={100}>
                <HeaderCell>Account</HeaderCell>
                <Cell dataKey="account" />
              </Column>
    
              <Column width={80}>
                <HeaderCell>Amount</HeaderCell>
                <Cell dataKey="amount" />
              </Column>
              <Column width={200} flexGrow={1}>
                <HeaderCell>Note</HeaderCell>
                <Cell dataKey="note" />
              </Column>
            </Table>
    
            <Pagination
              lengthMenu={[
                {
                    value: 10,
                    label: 10
                },
                {
                    value: 20,
                    label: 20
                },
                {
                    value: 50,
                    label: 50
                }
              ]}
              activePage={page}
              displayLength={displayLength}
              total={this.state.logs.length}
              onChangePage={this.handleChangePage}
              onChangeLength={this.handleChangeLength}
            />
          </div>
        );
    }
}

const mapStateToProps = state => ({
  logs: getTransactionLogs(state)
})

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(TransactionList)