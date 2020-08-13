import React, { Component } from 'react';
import { connect } from 'react-redux'; // Redux store provider
import LineChart from "@rsuite/charts/lib/charts/LineChart";
import Line from '@rsuite/charts/lib/series/Line';

const dataTemplate = [
    ["Pre-Game"],
    ["Turn 1"],
    ["Turn 2"],
    ["Turn 3"],
    ["Turn 4"],
    ["Turn 5"],
    ["Turn 6"],
    ["Turn 7"],
    ["Turn 8"],
    ["Turn 9"],
    ["Turn 10"],
    ["Turn 11"],
    ["Turn 12"],
    ["Turn 13"],
    ["Turn 14"],
    ["Turn 15"],
    ["Turn 16"]
];

function formatData(account) {
    let data = [...dataTemplate];
    for (let [index] in data) {
        data[index][1] = account.deposits[index]
        data[index][2] = account.withdrawals[index]
    };
    return data
}

class AccountGraph extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: formatData(this.props.account),
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.account !== this.props.account || prevProps.lastFetch !== this.props.lastFetch) {
            let data = formatData(this.props.account);
            this.setState({data});
        }
    }

    render() {
        let data = this.state.data
        return(
        <LineChart style={{left: '-80px', top: '-40px'}} height='50vh' data={data}>
            <Line name='Income/Turn' area />
            <Line name='Expenses/Turn' area />
        </LineChart>
        );
    }
}

const mapStateToProps = state => ({
    lastFetch: state.entities.accounts.lastFetch
});
  
const mapDispatchToProps = dispatch => ({});
  
export default connect(mapStateToProps, mapDispatchToProps)(AccountGraph);