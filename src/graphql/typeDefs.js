const {gql} = require("apollo-server-express");

module.exports = gql`
    type User {
        username: String
        email: String
        imageUrl: String
        createdAt: String
        token: String
        lastMessage: Message
    }
    type Message {
        uuid: String
        content: String
        from: String
        to: String
        createdAt: String
        reactions: [Reaction]
    }
    type Reaction {
        uuid: String
        content: String
        message: Message
        user: User
        createdAt: String
    }
    type Query {
        getUsers: [User]
        login(username: String password: String): User
        getMessages(from: String ):[Message]
    }
    type Mutation{
        register(username: String, email: String, password: String, confirmPassword: String): User
        sendMessage(to: String, content: String): Message
        reactToMessage(uuid: String content: String): Reaction
    }
    type  Subscription{
        newMessage: Message
        newReaction: Reaction
    }
`;