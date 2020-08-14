import React from 'react';
import { useSelector } from 'react-redux'
import { IconButton, Icon, Badge, Whisper, Popover, Tag } from 'rsuite'; // rsuite components



const UserList = () => {
    let users = useSelector(state => state.auth.users);
    let login = useSelector(state => state.auth.login);
    let socket = useSelector(state => state.auth.socket);
    let userList = []
    let online = users.length;
    let uncredentialed = 0
    for (let el of users) {
        uncredentialed = 0
        if (el.name === undefined) {
            uncredentialed++;
        } else if (el.name !== undefined) {
            userList.push(el)
        }
    };

    let i = 0;

    return (
        <div style={{position: 'fixed', bottom: 5, left: 5}}>
        <Whisper trigger="click" placement='autoVerticalStart' speaker={
            <Popover title="User List">
                {(uncredentialed > 0) ? <span>{uncredentialed} not signed in</span> : null }
                {userList.length > 0 && socket !== null ? 
                <React.Fragment>
                    <ul>
                        {userList.map(user => (
                            <li id={user.id}>{user.name} | {user.team} {user.id === socket.id && <Tag color='green'>Me</Tag>}</li>
                        ))}
                    </ul>
                </React.Fragment> : null }
            </Popover>} >
            <Badge content={online} >
                <IconButton icon={<Icon icon="user" />} circle size="md" />
            </Badge>
      </Whisper>
      </div>
    );
}
 
export default UserList;