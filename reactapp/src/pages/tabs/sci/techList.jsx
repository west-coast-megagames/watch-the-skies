import React, { Component } from 'react';
import { Table, Icon, Button, Progress, Affix } from 'rsuite';
import { lookupPct } from './../../../scripts/labs';
import SciIcon from './../../../components/common/sciencIcon';
import InfoTech from './InfoTech';
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
                <div> <Progress.Line strokeWidth={10} percent={ rowData.progressPct } status='active' /> </div>
            </Cell>
        )
    }
};



class TechList extends Component {

    state = {
        showInfo: false,    // Boolean to tell whether to open the Info Drawer
        research: {},       // The research item to display inside the Info Drawer
        data: []            // All of the data to display in the tech list table
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
                {/*}
                    <SciIcon size={50} level={0} />
                    <SciIcon size={45} level={1} />
                    <SciIcon size={100} level={2} />
                    <SciIcon size={100} level={3} />
                    <Icon icon="spinner" spin />
                    <Icon icon={sci1logo} size="lg" />
                    <hr />
                */}
                </Affix>
                <React.Fragment>
                    <Table
                        isTree
                        defaultExpandAllRows
                        rowKey="id"
                        autoHeight
                        data={this.state.data}
                        onExpandChange={(isOpen, rowData) => {
//                            console.log(isOpen, rowData);
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
                                return (
                                    <div>
                                        <SciIcon size={50} level={rowData.level} />
                                    </div>
                                )
                            }}
                            </Cell>
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
                                if (rowData.type !== 'category') {
                                return (
                                    <div style={{ verticalAlign: 'top'}}>
                                        <Button color='blue' size='sm' onClick={ () => this.infoPressed(rowData) } > Add'l Info </Button>
                                    </div>)
                                } 
                            }}
                            </Cell>
                        </Column>
                    </Table>
                
                    { this.state.showInfo ? 
                        <InfoTech
                            show={ this.state.showInfo }
                            onClick={ this.infoPressed }
                            research={ this.state.research}
                        /> 
                        : 
                        null 
                    }
                </React.Fragment>
            </div>
        );
    }

    infoPressed = async (rowData) => {
        this.setState({
            showInfo: !this.state.showInfo,
            research: rowData
        });
    };

    loadTable() {
        let data = this.state.data;
        let research = []; 

        let id_count = 0;
        let obj = {};
        data = [];
        for (let field of fields) {   
            id_count++; 
//            console.log("TEAM=",this.props.team);
            research = this.props.allResearch.filter(el => el.type !== "Knowledge" && el.team === this.props.team._id && el.field === field);
//            console.log("RES=",research);
            obj = {
                id: id_count,
                type: `category`,
                labelName: field,
                level: '',
                progressPct: -1,
                desc: '',
                prereqs: {},
                theoretical: {},
                children: research.map(el => {
                    return {
                        id:el._id,
                        type:el.type,
                        labelName:el.name,
                        level:el.level,
                        progressPct:lookupPct(el._id, research, this.props.techCost),
                        desc:el.desc,
                        prereqs:el.prereq,
                        theoretical:el.theoretical
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
