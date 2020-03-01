import React, { Component } from 'react';
import { Table, Icon, Button, Progress, Affix } from 'rsuite';
import { lookupPct } from './../../../scripts/labs';
import sci1logo from '../../../img/sci1.svg';
import SciIcon from './../../../components/common/sciencIcon';
const { Column, HeaderCell, Cell } = Table;
const fields = ['Military', 'Infrastructure', 'Biomedical', 'Agriculture'];


const ProgressCell = ({ rowData, dataKey, ...props }) => {
    let getPctResult = rowData.progressPct;
    if (getPctResult < 0) {     // If it is -1, then its a category.  Print "--"
        return (
            <Cell dataKey="progress" style={{ padding: 0 }} ></Cell>
        )
    } else {
        return (                // If it is >= 0, then its a research item.  Print the progress line
            <Cell {...props} style={{ padding: 0 }}>
                <div> <Progress.Line percent={ rowData.progressPct } status='active' /> </div>
            </Cell>
        )
    }
};


const ImageCell = ({ rowData, dataKey, ...props }) => {
    console.log("ROWDATA=",rowData);
    console.log("DATAKEY=",dataKey);
    console.log("PROPS=",props);
    return (    
        <Cell {...props} style={{ padding: 0 }}>
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
    )
};


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
    };


//    async toggleDeploy(){
//        this.setState({
//          isDeploying: !this.state.isDeploying
//        });
//    }

    render() {
        let props = this.props;
//        console.log(`Render: Count ${this.props.contacts.length}`);
//        const { length: count } = this.props.contacts;
//        const { account } = this.props
//        const disabled = account.balance < 1;
//
//        //if (count === 0)
//        //    return <h4>No radar contacts decending from or flying in high orbit</h4>
        return (            
            <div>
                <Affix>
                    <SciIcon size={50} level={0} />
                    <SciIcon size={45} level={1} />
                    <SciIcon size={100} level={2} />
                    <SciIcon size={100} level={3} />
                    <Icon icon="spinner" spin />
                    <Icon icon={sci1logo} size="lg" />
                    <hr />
                </Affix>
                <Table
                    isTree
                    wordWrap
                    defaultExpandAllRows
                    rowKey="id"
                    autoHeight
                    data={this.state.data}
                    onExpandChange={(isOpen, rowData) => {
    //                        console.log(isOpen, rowData);
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
                        <Cell style={{ padding: 0 }} >
                        {rowData => {
                            let myImg = "";
                            return (
                                <div>
                                    <Icon icon={sci1logo} size="lg" />
                                </div>
                            )
                        }}
                        </Cell>
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
                    </Column>

                    <Column align='center' verticalAlign='middle' width={150}  >
                        <HeaderCell>Current Progress</HeaderCell>
                        <ProgressCell 
                            allresearch={ props.allResearch }
                            techcost={ props.techCost }
                        />
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
            </div>
        );
    }

    loadTable() {
        let data = this.state.data;
        let research = []; 

        let id_count = 0;
        let obj = {};
        data = [];
        for (let field of fields) {   
            id_count++; 
//            console.log(field," ",id_count);
            research = this.props.allResearch.filter(el => el.type !== "Knowledge" && el.team === this.props.team._id && el.field === field);
//            console.log("RES=",research);
            obj = {
                id: id_count,
                type: `category`,
                labelName: field,
                level: '--',
                progress: '--',
                progressPct: -1,
                desc: '--',
                children: research.map(el => {
                    return {
                        id:el._id,
                        type:el.type,
                        labelName:el.name,
                        level:el.level,
                        progress:el.progress,
                        progressPct:lookupPct(el._id, research, this.props.techCost),
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
