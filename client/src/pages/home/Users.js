import React from 'react';
import {Col, Image,} from "react-bootstrap";
import {gql, useQuery} from "@apollo/client";
import {useMessageDispatch, useMessageState} from "../../contexts/message";
import moment from "moment";

const GET_USERS = gql`
    query getUsers{
        getUsers{
            username email imageUrl createdAt
            lastMessage{
                uuid from to content createdAt
            }
        }
    }
`;

const Users = () => {
    const dispatch = useMessageDispatch();
    const {users} = useMessageState();

    const {loading} = useQuery(GET_USERS, {
        onCompleted: (data) => {
            dispatch({
                type: 'SET_USERS',
                payload: data.getUsers
            })
        },
        onError: (err) => console.log(err)
    });

    let usersMarkup;
    if (loading) {
        usersMarkup = <p>Loading...</p>
    } else if (users.length === 0) {
        usersMarkup = <p>No user have joined yet</p>
    } else if (users.length > 0) {
        usersMarkup = users.map(user => {
            let selected = user.selected ? 'selected' : '';
            return (
                <div role="button"
                     key={user.username}
                     className={`user d-flex px-md-3 py-3 ${selected}`}
                     onClick={() => dispatch({type: 'SET_SELECTED_USER', payload: user.username})}
                >
                    <Image
                        src={user.imageUrl || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
                        roundedCircle
                        className="mr-2"
                        style={{maxWidth: 50, height: 50, objectFit: 'cover'}}/>
                    <div className="px-3 d-none d-md-block">
                        <p className="text-success m-0">{user.username}</p>
                        <p className="fw-lighter m-0">
                            {user.lastMessage ? user.lastMessage.content : 'You are now connected!'}
                        </p>
                        <small className="fw-lighter m-0">
                            {user.lastMessage && moment(user.lastMessage.createdAt).fromNow()}
                        </small>
                    </div>
                </div>
            )
        })
    }

    return (
        <Col xs={2} md={4} className="bg-secondary users-box">
            {usersMarkup}
        </Col>
    );
};

export default Users;