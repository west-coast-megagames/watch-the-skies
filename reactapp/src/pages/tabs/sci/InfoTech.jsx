import React, { Component } from 'react'
import { Drawer, Button, Table, Whisper, Icon, IconButton, Popover } from 'rsuite'
import SciIcon from './../../../components/common/sciencIcon';
const { Column, HeaderCell, Cell } = Table;

// This class institues the drawer for Information on a particular Science technology
class InfoTech extends Component {
	constructor(props) {
		super(props);
		this.state = {
			prereqs : {}    // The object of prerequisites for a particular tech, as depicted in the research array
		};
  }

	componentDidMount() {
		this.setState({prereqs: this.props.research.prereqs}) // The object of prerequisites for this particular tech
	}

	render() {
		let research = this.props.research;
		let theoretical = research.theoretical;     // The techs and upgrades that this can unlock

		return (
			<Drawer
					size='lg'
					show={this.props.show}
					onHide={() => this.props.onClick('cancel', null)}
			>
					<Drawer.Header >
							<Drawer.Title style={{fontSize: 32, color: 'blue' }}>
									<SciIcon size={100} level={research.level} />
									{research.labelName}
							</Drawer.Title>
					</Drawer.Header>

				<Drawer.Body>
					<p style={{fontSize: 18, color: 'blue' }}><b>Description:</b></p>
					<p>{ research.desc }</p>
					<hr />
					<p style={{fontSize: 18, color: 'blue' }}><b>Prerequisites:</b></p>
					<Table
						rowKey="id"
						autoHeight
						data={this.state.prereqs}
						rowHeight={40}
						style={{ padding: 0 }}
					>
						<Column verticalAlign='middle' width={125}>
							<HeaderCell>Type</HeaderCell>
							<Cell dataKey="type" />
						</Column>

						<Column verticalAlign='middle' width={200}>
							<HeaderCell>Name</HeaderCell>
							<Cell dataKey="code" />
						</Column>
					</Table>
					<br />
					<p style={{fontSize: 18, color: 'blue' }}><b>Theoretical Applications:</b></p>
					<Table
						rowKey="id"
						autoHeight
						wordWrap
						data={theoretical}
					>
						<Column verticalAlign='middle' width={125}>
							<HeaderCell>Type</HeaderCell>
							<Cell dataKey="field" />
						</Column>

						<Column verticalAlign='middle' width={225}>
							<HeaderCell>Name</HeaderCell>
							<Cell dataKey="name" />
						</Column>

						<Column align='center' verticalAlign='middle' width={50}>
							<HeaderCell>Level</HeaderCell>
							<Cell style={{ padding: 0 }} >
							{rowData => {
								return (
									<div>
										<SciIcon size={25} level={rowData.level} />
									</div>
								)
							}}
							</Cell>
						</Column>
							
						<Column verticalAlign='middle' width={50}>
							<HeaderCell>Info</HeaderCell>
							<Cell>
								{rowData => {
									return (
										<div>
											<Whisper placement="top" speaker={infoSpeaker(rowData.name, rowData.prereq)} trigger="click">
												<IconButton size="xs" icon={<Icon icon="info-circle" />} />
											</Whisper>
										</div>
									)
							}}
							</Cell>
						</Column>

						<Column verticalAlign='middle' width={375}>
							<HeaderCell>Description</HeaderCell>
							<Cell dataKey="desc" />
						</Column>
					</Table>
					<br />
				</Drawer.Body>

				<Drawer.Footer>
					<Button onClick={() => this.props.onClick()} appearance="primary">Close</Button>
				</Drawer.Footer>
			</Drawer>
		);
	}
}

const infoSpeaker = (title, theoreticalPrereqs) => {
    let fullTitle = "'" + title + "' Prerequisites";
    return (
        <Popover title={fullTitle} >
            <p>Prereqs are unknown for theoreticals</p>
        </Popover>
    )
}

export default InfoTech;