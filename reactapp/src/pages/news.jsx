import React, { Component } from 'react'; // React import
import { Container, Content, Sidebar } from 'rsuite';

class News extends Component {
    constructor() {
        super();
        this.state = {};
    }

    render() {
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