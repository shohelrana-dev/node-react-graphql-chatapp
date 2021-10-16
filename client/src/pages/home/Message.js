import React, {useState} from 'react';
import {useAuthState} from "../../contexts/auth";
import {Button, OverlayTrigger, Popover} from "react-bootstrap";
import moment from "moment";
import {gql, useMutation} from "@apollo/client";

const reactions = ['❤️', '😆', '😯', '😢', '😡', '👍', '👎'];

const REACT_TO_MESSAGE = gql`
    mutation reactToMessage($uuid: String $content: String){
        reactToMessage(uuid: $uuid, content: $content) {
            content createdAt uuid
        }
    }
`;

const Message = ({message}) => {
    const {user} = useAuthState();
    const sent = message.from === user.username;
    const bgClass = sent ? 'bg-primary' : 'bg-secondary';
    const textClass = sent ? 'text-white' : 'text-dark';
    const marginAutoClass = sent ? 'ml-auto' : 'mr-auto';
    const sentReceivedClass = sent ? 'sent' : 'received';

    const [showPopOver, setShowPopOver] = useState();

    const [reactToMessage] = useMutation(REACT_TO_MESSAGE, {
        onError: error => console.log(error),
        onCompleted: data => {
            setShowPopOver(false);
        }
    });

    const react = (reaction) => {
        reactToMessage({
            variables: {uuid: message.uuid, content: reaction}
        });
    }


    const reactButton = (
        <OverlayTrigger
            placement={sent ? 'left' : 'right'}
            delay={{show: 250, hide: 400}}
            trigger="click"
            show={showPopOver}
            onToggle={setShowPopOver}
            transition={false}
            rootClose
            overlay={<Popover className="rounded-pill">
                <Popover.Content className="react-btn-popover">
                    {reactions.map(reaction=>(
                        <Button variant="link" className="btn-transparent react-icon-btn" key={reaction} onClick={()=>react(reaction)}>
                            {reaction}
                        </Button>
                    ))}
                </Popover.Content>
            </Popover>}
        >
            <Button variant="link" className="btn-transparent btn-react">
                <i className="far fa-smile"></i>
            </Button>
        </OverlayTrigger>
    );

    return (
            <div className={`d-flex my-3 ${sentReceivedClass} ${marginAutoClass}`}>
                {sent && reactButton}
                <div>
                    <div className={`py-2 px-3 rounded-pill position-relative ${bgClass}`}>
                        {message.reactions.length > 0 && (
                            <div className="reactions bg-secondary p-1 rounded-pill">
                                {message.reactions.map(reaction => reaction.content)}
                            </div>
                        )}
                        <p className={textClass}>
                            {message.content}
                        </p>
                    </div>
                    <small className="time">{moment(message.createdAt).fromNow()}</small>
                </div>
                {!sent && reactButton}
            </div>
    );
};

export default Message;