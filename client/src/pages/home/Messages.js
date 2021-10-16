import React, {useEffect} from 'react';
import {Col, Form, Button} from "react-bootstrap";
import {gql, useLazyQuery, useMutation} from "@apollo/client";
import {useMessageDispatch, useMessageState} from "../../contexts/message";
import Message from "./Message";

const GET_MESSAGES = gql`
    query ($from: String){
        getMessages(from: $from) {
            uuid from to content createdAt reactions {
                content uuid createdAt
            }
        }
    }
`;
const SEND_MESSAGE = gql`
    mutation ($to: String $content: String){
        sendMessage (to: $to content: $content){
            uuid from to content createdAt
        }
    }
`;

const Messages = () => {
    const messageDispatch = useMessageDispatch();
    const {users} = useMessageState();
    const selectedUser = users?.find(user => (user.selected === true));

    const [sendMessage] = useMutation(SEND_MESSAGE, {
        onError: err => console.log(err)
    });

    const [getMessages, {loading}] = useLazyQuery(GET_MESSAGES, {
        onCompleted: (data) => {
            messageDispatch({
                type: 'SET_USER_MESSAGES',
                payload: {
                    username: selectedUser.username,
                    messages: data.getMessages
                }
            })
        },
        onError: err => console.log(err)
    });

    useEffect(() => {
        if (selectedUser) {
            getMessages({
                variables: {from: selectedUser.username}
            })
        }
    }, [selectedUser, getMessages]);

    const messageFormSubmit = (ev) => {
        ev.preventDefault();
        if (ev.target.message.value.trim() === '' || !selectedUser) {
            return;
        }
        sendMessage({
            variables: {
                to: selectedUser.username,
                content: ev.target.message.value.trim()
            }
        });
        ev.target.reset();
    }


    const {messages} = selectedUser || {};

    let selectedChatMarkup;
    if (loading) {
        selectedChatMarkup = <p className="info-text">Loading...</p>
    } else if (!loading && !messages) {
        selectedChatMarkup = <p className="info-text">Select a friend</p>
    } else if (messages.length > 0) {
        selectedChatMarkup = messages.map(message => (
            <Message key={message.uuid} message={message}/>
        ))
    } else if (messages.length === 0) {
        selectedChatMarkup = <p className="info-text">You are now connected! send your first message!</p>
    }

    return (
        <Col xs={10} md={8} className="chat-box">
            <div className="d-flex flex-column-reverse">
                {selectedChatMarkup}
            </div>
            <div>
                <Form onSubmit={messageFormSubmit}>
                    <Form.Group className="d-flex align-items-center">
                        <Form.Control
                            type="text"
                            name="message"
                            placeholder="Type a message..."
                            className="message-input rounded-pill bg-secondary border-0 px-4"
                        />
                        <Button type="submit" variant="link" className="btn-transparent">
                            <i className="fas fa-paper-plane fa-2x text-primary ml-2"></i>
                        </Button>
                    </Form.Group>
                </Form>
            </div>
        </Col>
    );
};

export default Messages;