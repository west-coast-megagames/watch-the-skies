import React from 'react';
import { useSelector } from 'react-redux'
import { IconButton, Icon, Badge, Whisper, Popover, Tag } from 'rsuite'; // rsuite components



const UserList = () => {
    let users = useSelector(state => state.auth.users);
    let myUser = useSelector(state => state.auth.user);
    let userList = []
    let online = users.length;
    let uncredentialed = 0
    for (let el of users) {
			uncredentialed = 0
			 if (el.username !== undefined) {
					userList.push(el)
			}
	};

    return (
        <div style={{position: 'fixed', bottom: 5, left: 5, zIndex: 999 }}>
        <Whisper trigger="hover" placement='autoVerticalStart' speaker={
            <Popover title="User List">
                {(uncredentialed > 0) ? <span>{uncredentialed} not signed in</span> : null }
                {userList.length > 0 && myUser !== null ? 
                <React.Fragment>
                    <ul>
                        {userList.map(user => (
                            <li id={user.userID}>{user.username} | {user.username === myUser.username && <Tag color='green'>Me</Tag>}</li>
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