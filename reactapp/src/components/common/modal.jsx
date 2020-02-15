import React, { Component } from 'react';
import { Modal, Button } from 'rsuite';

class Model extends Component {
    constructor(props) {
      super(props);
      this.state = {
        show: false,
        overflow: true
      };
      this.close = this.close.bind(this);
      this.open = this.open.bind(this);
    }
    close() {
      this.setState({ show: false });
    }
    open(event) {
      this.setState({ show: true });
    }
    render() {
      const { overflow } = this.state;
      return (
        <div className="modal-container">
          <Modal overflow={overflow} show={this.props.show} onHide={this.props.close}>
            <Modal.Header>
              <Modal.Title>Interception Report</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>{this.props.report}</p>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={this.props.close} appearance="primary">
                Ok
              </Button>
              <Button onClick={this.props.close} appearance="subtle">
                Cancel
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      );
    }
  }
  
  export default Model