import React from "react";
import { Line } from "react-chartjs-2";
import { MDBContainer } from "mdbreact";

class ChartsPage extends React.Component {
  state = {
    dataLine: {
      labels: ["Pre-game", "Q1 2020", "Q2 2020", "Q3 2020", "Q4 2020", "Q1 2021", "Q2 2021", "Q3 2021", "Q4 2021", "Q1 2022", "Q2 2022", "Q3 2022", "Q4 2022", ],
      datasets: [
        {
          label: "Income/Turn",
          fill: true,
          lineTension: 0.3,
          backgroundColor: "rgba(225, 204,230, .3)",
          borderColor: "rgb(205, 130, 158)",
          borderCapStyle: "butt",
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: "miter",
          pointBorderColor: "rgb(205, 130,1 58)",
          pointBackgroundColor: "rgb(255, 255, 255)",
          pointBorderWidth: 10,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: "rgb(0, 0, 0)",
          pointHoverBorderColor: "rgba(220, 220, 220,1)",
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          data: [15, 22, 10, 12, 11, 22, 26, 0]
        },
        {
          label: "Expenses/Turn",
          fill: true,
          lineTension: 0.3,
          backgroundColor: "rgba(184, 185, 210, .3)",
          borderColor: "rgb(35, 26, 136)",
          borderCapStyle: "butt",
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: "miter",
          pointBorderColor: "rgb(35, 26, 136)",
          pointBackgroundColor: "rgb(255, 255, 255)",
          pointBorderWidth: 10,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: "rgb(0, 0, 0)",
          pointHoverBorderColor: "rgba(220, 220, 220, 1)",
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          data: [15, 22, 10, 12, 11, 22, 26, 0]
        }
      ]
    }
  };

  componentDidMount () {
      if (this.props.account !== undefined) {
      let account = this.props.account
      let { dataLine } = this.state;
      console.log(account);
      let datasetIndex = dataLine.datasets.findIndex(set => set.label === 'Income/Turn');
      dataLine.datasets[datasetIndex].data = account.deposits;
      datasetIndex = dataLine.datasets.findIndex(set => set.label === 'Expenses/Turn');
      dataLine.datasets[datasetIndex].data = account.withdrawals;
      this.setState({ dataLine });
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.account !== prevProps.account && this.props.accounts.length > 0) {
      let account = this.props.account;
      let { dataLine } = this.state;
      console.log(account);
      let datasetIndex = dataLine.datasets.findIndex(set => set.label === 'Income/Turn');
      dataLine.datasets[datasetIndex].data = account.deposits;
      datasetIndex = dataLine.datasets.findIndex(set => set.label === 'Expenses/Turn');
      dataLine.datasets[datasetIndex].data = account.withdrawals;
      this.setState({ dataLine });
    }
  }

  render() {
    if (this.props.account === undefined || this.props.accounts.length <= 0) {
      return(
        <div>
          <p>No Chart Available</p>
        </div>
      )
    };

    return (
      <MDBContainer>
        <Line data={this.state.dataLine} options={{ responsive: true }} />
      </MDBContainer>
    );
  }
}

export default ChartsPage;