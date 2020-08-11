import React from 'react';
import { useSelector } from 'react-redux'
import { IconButton, Icon, Badge, Whisper, Popover } from 'rsuite'; // rsuite components



const UserList = () => {
    let users = useSelector(state => state.auth.users)
    let me = useSelector(state => state.auth.user)
    let login = useSelector(state => state.auth.login)
    let userList = []
    let online = (users.length > 0) ? users.length - 1 : users.length;
    let uncredentialed = 0
    for (let el of users) {
        uncredentialed = 0
        if (el.name === undefined) {
            uncredentialed++;
        } else if (el.name !== me && el.name !== undefined) {
            userList.push(el)
        }

    };

    return (
        <div style={{position: 'fixed', bottom: 5, left: 5}}>
        <Whisper trigger="click" placement='autoVerticalStart' speaker={
            <Popover title="User List">
                {(uncredentialed > 0 && login) ? <span>{uncredentialed} not signed in</span> : null }
                {userList.length > 0 ? 
                <React.Fragment>
                    <ul>
                        {userList.map(user => (
                            <li>{user.name} | {user.team}</li>
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