import React, { Component } from 'react';
import axios from 'axios';
import { gameServer } from '../../../config';
import { Table, Tag, Progress, Checkbox, Button, Alert } from 'rsuite';

const { Column, HeaderCell, Cell } = Table;
const fields = ['Biology', 'Computer Science', 'Electronics', 'Engineering', 'Genetics', 'Material Science','Physics', 'Psychology', 'Social Science', 'Quantum Mechanics'];

class Knowledge extends Component {
    state = { 
        data: [],
        checkedKeys: [],
        cost: 0,
        account: {}
    }

    componentDidMount() {
        let knowledge = this.props.allResearch.filter(el => el.type === 'Knowledge');
        if (knowledge.length !== 0) {               // This is to account for knowledge not being seeded
            let tableKnowlege = this.createTable(knowledge);
            let account = this.props.accounts[this.props.accounts.findIndex(el => el.code === 'SCI')];
            this.setState({ data: tableKnowlege, account });
        } 
    }

    componentDidUpdate (prevProps, prevState) {
        if (prevState.checkedKeys !== this.state.checkedKeys) {
            let cost = this.state.checkedKeys.length * 2;
            this.setState({cost})    
        }
        
    }
    
    createTable = (knowledge) => {
        let data = this.state.data;
        console.log(fields)
        for (let field of fields) {
            let object = {};
            console.log(field);
            object.field = field;
            object.research = undefined;
            object.complete = []
            object.research_id = ''
            let fieldResearch = knowledge.filter(el => el.field === field);
            for (let el of fieldResearch) {
                if (el.status.completed === true) {
                    object.complete.push(el)
                } else if (el.status.completed === false) {
                    object.research = el
                    object.research_id = el._id
                }
            };
            data.push(object);
        }
        return data;
    }
    
    render() {
        const { data, checkedKeys } = this.state;

        let checked = false;
        let indeterminate = false;
        
    
        if (checkedKeys.length === data.length) {
          checked = true;
        } else if (checkedKeys.length === 0) {
          checked = false;
        } else if (checkedKeys.length > 0 && checkedKeys.length < data.length) {
          indeterminate = true;
        }
        
        
        return ( 
            <div>
                <h5 style={{display: 'inline'}}>Research Field Funding</h5><Button onClick={() => this.handleSubmit()} style={{float:'right'}}>Submit funding</Button>
                <hr style={{margin: 10}} />
                <Table
                    rowKey="field"
                    autoHeight
                    data={data}
                    >
                    <Column width={50} align="center">
                        <HeaderCell style={{ padding: 0 }}>
                        <div style={{ lineHeight: '40px' }}>
                            <Checkbox
                            inline
                            checked={checked}
                            indeterminate={indeterminate}
                            onChange={this.handleCheckAll}
                            />
                        </div>
                        </HeaderCell>
                        <CheckCell
                            dataKey="research_id"
                            checkedKeys={checkedKeys}
                            onChange={this.handleCheck}
                        />
                    </Column>
                    <Column width={200}>
                        <HeaderCell>Field</HeaderCell>
                        <Cell dataKey="field" />
                    </Column>
                    <Column align='center' width={100}>
                        <HeaderCell>Global Level</HeaderCell>
                        <Cell>{rowData => {
                            let currentLevel = rowData.research.level - 1;
                            return(
                                <Tag color='green'>{currentLevel}</Tag>
                        )}}</Cell>
                    </Column>

                    <Column verticalAlign='middle' flexGrow={1}>
                        <HeaderCell>Global Progress Towards next Level <Tag color="green" style={{float:'right'}}>Funding Cost: $M{this.state.cost}</Tag></HeaderCell>
                        <Cell dataKey="research.progress">{rowData => {
                            let progress = rowData.research.progress;
                            let percent = progress / this.props.techCost[rowData.research.level] * 100
                            console.log(percent);
                            return(
                                <Progress.Line percent={progress} />
                        )}}</Cell>

                    </Column>
                </Table>
            </div>
        );
        
    }

    handleCheckAll = (value, checked) => {
        const checkedKeys = checked ? this.state.data.map(item => item.research_id) : [];
        this.setState({
          checkedKeys
        });
      }

    handleCheck = (value, checked) => {
        const { checkedKeys } = this.state;
        const nextCheckedKeys = checked
          ? [...checkedKeys, value]
          : checkedKeys.filter(item => item !== value);
    
        this.setState({
          checkedKeys: nextCheckedKeys
        });
    }

    handleSubmit = async () => {
        let { account, cost, checkedKeys } = this.state
        if (account.balance < cost) {
            Alert.warning(`The ${account.name} account currently doesn't have the funds to cover this level of funding.`, 6000)
        } else {
            try {
                const txn = {
                    account_id : account._id,
                    note : `$M${cost} funding for ${checkedKeys.length} fields of study.`,
                    amount : cost
                }
                let { data } = await axios.post(`${gameServer}api/banking/withdrawal`, txn);
                console.log(data)
                Alert.success(data, 4000)  
                try {
                    let submission = {
                        research: checkedKeys,
                        funding: 0,
                        _id: '5e576cae7b1af50d0c02c70c'
                    }
                    let { data } = await axios.put(`${gameServer}api/facilities/research`, submission);
                    console.log(data)
                    Alert.success(data, 4000)

                    this.setState({
                        checkedKeys: []
                      });
                } catch (err) {
                    Alert.error(`Error: ${err}`)
                }
            } catch (err) {
                Alert.error(`Error: ${err}`)
            }
        }
        this.setState({
          checkedKeys: []
        });
    }
}


const CheckCell = ({ rowData, onChange, checkedKeys, dataKey, ...props }) => (
    <Cell {...props} style={{ padding: 0 }}>
      <div style={{ lineHeight: '46px' }}>
        <Checkbox
          value={rowData[dataKey]}
          inline
          onChange={onChange}
          checked={checkedKeys.some(item => item === rowData[dataKey])}
        />
      </div>
    </Cell>
  );

export default Knowledge;