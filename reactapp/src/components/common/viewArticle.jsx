import React from 'react';
import { IconButton, ButtonToolbar, Icon, Alert, Button, Modal, Divider, Input, List, FlexboxGrid } from "rsuite";
import socket from '../../socket';
import TeamAvatar from "./teamAvatar";

const ViewArticle = (props) => {
	const [comment, setComment] = React.useState(false);
  let article = props.articles.find(el => el._id === props.id);

	const calculate = (reactions, type) => {
		let temp = reactions.filter(el => el.emoji === 'thumbs-up');
		temp = temp.length
		return temp;
	}

	const handleComment = () => {
		socket.emit('request', { route: 'article', action: 'comment', data: { id: article._id, user: props.user, comment, } });
		setComment(false);
	}

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


					<Divider>
						
							{typeof(comment) !== 'string' && <Button color='blue' onClick={() => setComment('')}>Leave Comment</Button>}
							{typeof(comment) === 'string' && <ButtonToolbar>
								<Button onClick={() => setComment(false)}>Cancel</Button>
								<Button color='blue' disabled={comment.length < 5} onClick={() => handleComment()}>{comment.length < 5 ? <b>{5 - comment.length}</b> : <b>Submit Comment</b>}</Button>
							</ButtonToolbar>}
						
					</Divider>

          {typeof(comment) === 'string' && <Input
            value={comment}
						componentClass="textarea" 
						placeholder="Leave a Comment!"
						rows={3}
            onChange={value => setComment(value)}
          />}


					<List hover>
						{article.comments.map((comment, index) => (
							<List.Item key={index}>
								<FlexboxGrid align='middle' >
									<FlexboxGrid.Item colspan={1}>
										<TeamAvatar size={'sm'} code={'none'} /> 
										
									</FlexboxGrid.Item>
									<FlexboxGrid.Item colspan={23}>
										<b>{comment.user}</b>
										<p>{comment.comment}</p>
									</FlexboxGrid.Item>
								</FlexboxGrid>
							</List.Item>
						))}
					</List>

        </Modal.Body>
        <Modal.Footer>
          <ButtonToolbar style={{float: 'right'}}>
            <IconButton icon={<Icon icon='thumbs-up' />} onClick={() => socket.emit('request', { route: 'article', action: 'react', data: { id: article._id, user: props.user, emoji: 'thumbs-up'} })}>{calculate(article.reactions, 'thumbs-up')}</IconButton>
            <Button color='red' onClick={() => props.onClose()} appearance="subtle"> Close </Button>
          </ButtonToolbar>
        </Modal.Footer>
      </React.Fragment>
  );
}
 
export default ViewArticle;