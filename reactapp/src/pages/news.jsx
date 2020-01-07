import React, { Component } from 'react'; // React import
import { Container, Content, Sidebar } from 'rsuite';

class News extends Component {
    constructor() {
        super();
        this.state = {
          tab: 'dashboard'
        };
        this.handleSelect = this.handleSelect.bind(this);
    }

    getActive(element) {
        return element === this.state.tab ? '' : 'hidden'
    }

    handleSelect(activeKey) {
        this.setState({ tab: activeKey })
    }

    render() {
        const { tab } = this.state; 

         return (
        <Container>
            <Sidebar style={{ paddingLeft: 20 }}>
            </Sidebar>
            <Content>
                <h5>The News system has not been created!</h5>
            </Content>
        </Container>
         );
     }
 }

export default News;