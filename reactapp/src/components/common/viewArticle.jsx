import React from 'react';
import { IconButton, ButtonToolbar, Icon, Alert, Button, Modal, Divider } from "rsuite";
import socket from '../../socket';
import TeamAvatar from "./teamAvatar";

const ViewArticle = (props) => {
    let article = props.article
    return (
        <React.Fragment>
          <Modal.Header>
            <Modal.Title>
              <TeamAvatar size={"sm"} code={article.agency} /><span style={{marginLeft:'10px', display: 'inline', verticalAlign:'super'}}>{article.headline}</span>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p><b>Author:</b> Some Bloke | <b>Publisher:</b> {article.publisher.name}</p>
            <p>{article.location.dateline} - {article.timestamp.turn}</p>
            <Divider />
            <p>{article.body}</p>
          </Modal.Body>
          <Modal.Footer>
            <ButtonToolbar style={{float: 'right'}}>
              <IconButton icon={<Icon icon='thumbs-up' />} onClick={() => socket.emit('request', { route: 'news', action: 'react', data: { id: article._id, user: props.user, emoji: 'thumbs-up'} })}>{article.likes}</IconButton>
              <Button color='red' onClick={() => props.onClose()} appearance="subtle"> Close </Button>
            </ButtonToolbar>
          </Modal.Footer>
        </React.Fragment>
    );
}
 
export default ViewArticle;