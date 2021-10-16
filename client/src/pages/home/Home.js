import React, { Fragment, useEffect } from 'react';
import { Col, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuthDispatch, useAuthState } from "../../contexts/auth";
import Users from "./Users";
import Messages from "./Messages";
import { gql, useSubscription } from '@apollo/client';
import { useMessageDispatch } from '../../contexts/message';

const NEW_MESSAGE = gql`
    subscription newMessage{
        newMessage{
            uuid from to content createdAt
        }
    }
`;

const NEW_REACTION = gql`
    subscription newReaction{
        newReaction{
            uuid content createdAt message{
                uuid from to 
            }
        }
    }
`;

const Home = () => {
    const authDispatch = useAuthDispatch();

    const {user} = useAuthState();

    const {data: messageData, error: messageError} = useSubscription(NEW_MESSAGE);
    const {data: reactionData, error: reactionError} = useSubscription(NEW_REACTION);

    const messageDispatch = useMessageDispatch();

    useEffect(()=>{
        if(messageError) console.log(messageError);
        const message = messageData?.newMessage;
        if(message){
            const otherUserName = user.username === message.to ? message.from : message.to;
            messageDispatch({
                type: 'ADD_MESSAGE',
                payload: {
                    username: otherUserName,
                    message
                }
            })
        }
    }, [messageData, messageError, messageDispatch, user]);

    useEffect(()=>{
        if(reactionError) console.log(reactionError);
        const reaction = reactionData?.newReaction;
        if(reaction){
            const otherUserName = user.username === reaction.message.to ? reaction.message.from : reaction.message.to;
            messageDispatch({
                type: 'ADD_REACTION',
                payload: {
                    username: otherUserName,
                    reaction
                }
            })
        }
    }, [reactionData, reactionError, messageDispatch, user]);

    const logout = () => {
        authDispatch({
            type: 'LOGOUT'
        });
        window.location.href = '/login';
    }

    return (
        <Fragment>
            <Row className="bg-white d-flex justify-content-around mb-1 py-3">
                <Col className="text-center">
                    <Link to="/login" variant="link">Login</Link>
                </Col>
                <Col className="text-center">
                    <Link to="/signup" variant="link">Signup</Link>
                </Col>
                <Col className="text-center">
                    <Link to="#" onClick={logout} variant="link">Logout</Link>
                </Col>
            </Row>
            <Row className="bg-white chat-wrapper">
                <Users/>
                <Messages />
            </Row>
        </Fragment>
    );
};

export default Home;