import React, { Component } from 'react';
import { Table } from 'rsuite';
import { connect } from 'react-redux';
import { getTransactionReports } from '../../store/entities/reports';

const { Column, HeaderCell, Cell, Pagination } = Table;

const TransactionList = (props) => {
	const [displayLength, setDisplayLength] = React.useState(10);
	const [page, setPage] = React.useState(1);
	const { reports } = props;


  const handleChangeLength = (dataKey) => {
		setDisplayLength(dataKey);
		setPage(1);
  }

  const getData = () => {
  	return reports.filter((v, i) => {
  	  const start = displayLength * (page - 1);
  	  const end = start + displayLength;
  	  return i >= start && i < end;
  	});
  }
	const data = getData();
    
  return (
    <div>
      <Table autoHeight affixHeader data={data} >
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
        total={reports.length}
        onChangePage={(dataKey) => setPage(dataKey)}
        onChangeLength={handleChangeLength}
      />
    </div>
  );
    
}

const mapStateToProps = state => ({
  reports: getTransactionReports(state) // This used to be loghs but I changed it to Reports since we are phasing out reports
})

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(TransactionList)