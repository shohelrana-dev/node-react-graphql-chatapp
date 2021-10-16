import React, {createContext, useReducer, useContext} from 'react';

const MessageStateContext = createContext();
const MessageDispatchContext = createContext();

const messageReducer = (state, action) => {
    let {username, messages, message, reaction} = action.payload;
    let usersCopy, userIndex, userCopy;
    switch (action.type) {
        case 'SET_USERS':
            return {...state, users: action.payload}

        case 'SET_USER_MESSAGES':
            usersCopy = [...state.users];
            userIndex = usersCopy.findIndex(u => u.username === username);
            usersCopy[userIndex] = {...usersCopy[userIndex], messages};
            return {...state, users: usersCopy};

        case 'SET_SELECTED_USER':
            usersCopy = state.users.map(user => ({
                ...user,
                selected: user.username === action.payload
            }));
            return {...state, users: usersCopy}

        case 'ADD_MESSAGE':
            usersCopy = [...state.users];
            userIndex = usersCopy.findIndex(u => u.username === username);
            message.reactions =[];
            userCopy = {
                ...usersCopy[userIndex],
                messages: usersCopy[userIndex].messages ? [message, ...usersCopy[userIndex].messages] : null,
                latestMessage: message
            }
            usersCopy[userIndex] = userCopy;
            return {...state, users: usersCopy}

        case 'ADD_REACTION':
            usersCopy = [...state.users];
            userIndex = usersCopy.findIndex(u => u.username === username);
            //make a shallow copy of user
            userCopy = {...usersCopy[userIndex]};
            //find index of the message
            let messageIndex = userCopy.messages?.findIndex(m => m.uuid === reaction.message.uuid);
            if(messageIndex > -1){
                //make a shallow copy of user messages
                let messagesCopy = [...userCopy.messages];
                //make a shallow copy of user reactions
                let reactionsCopy = [...messagesCopy[messageIndex].reactions];
                let reactionIndex = reactionsCopy.findIndex(r => r.uuid === reaction.uuid);

                if(reactionIndex > -1){
                    //Reactions exists, update it
                    reactionsCopy[reactionIndex] = reaction;
                }else {
                    //New reaction, add it
                    reactionsCopy = [...reactionsCopy, reaction];
                }
                messagesCopy[messageIndex] = {...messagesCopy[messageIndex], reactions: reactionsCopy};
                userCopy = {...userCopy, messages: messagesCopy};
                usersCopy[userIndex] = userCopy;
            }
            return {...state, users: usersCopy};

        default:
            throw new Error(`Unknown action type ${action.type}`);
    }
}

export const MessageProvider = ({children}) => {
    const [state, dispatch] = useReducer(messageReducer, {users: []});
    return (
        <MessageDispatchContext.Provider value={dispatch}>
            <MessageStateContext.Provider value={state}>
                {children}
            </MessageStateContext.Provider>
        </MessageDispatchContext.Provider>
    );
};

export const useMessageState = () => {
    return useContext(MessageStateContext);
}
export const useMessageDispatch = () => {
    return useContext(MessageDispatchContext);
}