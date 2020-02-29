import React, { Component } from 'react';
import { Table, Icon, Button } from 'rsuite';
const { Column, HeaderCell, Cell } = Table;
const fields = ['Military', 'Infrastructure', 'Biomedical', 'Agriculture'];

class TechList extends Component {

    state = {
        data: []
    };

    componentDidMount() {
        this.loadTable();
    };

    componentDidUpdate(prevProps, prevState) {
        if (prevProps !== this.props) {
            this.loadTable();
        }
    }

//    async toggleDeploy(){
//        this.setState({
//          isDeploying: !this.state.isDeploying
//        });
//    }

    render() {
//        console.log(`Render: Count ${this.props.contacts.length}`);
//        const { length: count } = this.props.contacts;
//        const { account } = this.props
//        const disabled = account.balance < 1;
//
//        //if (count === 0)
//        //    return <h4>No radar contacts decending from or flying in high orbit</h4>
        return (            
                <Table
                    isTree
                    wordWrap
                    defaultExpandAllRows
                    rowKey="id"
                    autoHeight
                    data={this.state.data}
                    onExpandChange={(isOpen, rowData) => {
                        console.log(isOpen, rowData);
                    }}
                    renderTreeToggle={(icon, rowData) => {
                        if (rowData.children && rowData.children.length === 0) {
                        return <Icon icon="spinner" spin />;
                        }
                        return icon;
                    }}
                    >
                    <Column verticalAlign='middle' width={275}>
                        <HeaderCell>Known Technologies</HeaderCell>
                        <Cell dataKey="labelName" />
                    </Column>

                    <Column align='center' verticalAlign='middle' width={50}>
                        <HeaderCell>Level</HeaderCell>
                        <Cell dataKey="level" style={{ padding: 0 }}>
                            {/*<div
                                style={{
                                    width: 40,
                                    height: 40,
                                    //background: '#f5f5f5',
                                    //borderRadius: 20,
                                    //marginTop: 2,
                                    //overflow: 'hidden',
                                    display: 'inline-block'
                            }}
                            >
                            <img src={(rowData) => {
                                if (rowData.level !== null) {
                                    return 'rowData[dataKey]} width="44" '
                                }
                                return 'rowData[dataKey]} width="44" '
                            }}
                        </div>*/}
                        </Cell>
                    </Column>

                    <Column align='center' verticalAlign='middle' width={150}  >
                        <HeaderCell>Current Progress</HeaderCell>
                        <Cell dataKey="progress" />
                    </Column>

                    <Column width={100} flexGrow={1} >
                        <HeaderCell>Description</HeaderCell>
                        <Cell dataKey="desc" />
                    </Column>

                    <Column align='center' verticalAlign='middle' width={150} fixed="right">
                        <HeaderCell>Action</HeaderCell>
                        <Cell style={{ padding: 0 }} >
                        {rowData => {
                            function handleAction() {
                                {/*rowData.deploy('deploy', rowData.target, null)*/}
                            }
                            if (rowData.type !== 'category') {
                            return (
                                <div style={{ verticalAlign: 'top'}}>
                                    <Button color='blue' size='sm' onClick={handleAction}> Add'l Info </Button>
                                </div>)
                            } 
                        }}
                        </Cell>
                    </Column>
                </Table>
        );
    }

    createTable = (knowledge) => {
        let data = this.state.data;
        for (let field of fields) {
            let object = {};
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

    loadTable() {
        let data = this.state.data;
        let research = []; 

        let id_count = 0;
        let obj = {};
        data = [];
        for (let field of fields) {   
            id_count++; 
            console.log(field," ",id_count);
            research = this.props.allResearch.filter(el => el.type !== "Knowledge" && el.team === this.props.team._id && el.field === field);
            console.log("RES=",research);
            obj = {
                id: id_count,
                type: `category`,
                labelName: field,
                level: '--',
                progress: '--',
                desc: '--',
//            status: this.props.contacts.length !== 0 ? `${this.props.contacts.length} contacts` : 'No contacts',
//            info: `Advanced high orbit contacts...`,
                children: research.map(el => {
                    return {
                    id:el._id,
                    type:el.type,
                    labelName:el.name,
                    level:el.level,
                    progress:el.progress,
                    desc:el.desc
//                    status:'Unknown',
//                    location:el.country.name,
//                    target: el,
//                    deploy: this.props.deployInterceptors
                    };
                })
            }
            data.push(obj);
        }    

        this.setState({ data })
    
    }
}

export default TechList;
