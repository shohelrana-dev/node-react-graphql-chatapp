const {PubSub} = require("graphql-subscriptions");
const jwt = require("jsonwebtoken");
const {AuthenticationError} = require("apollo-server-core");
const pubsub = new PubSub();


module.exports = ({req, connection}) => {
    let authToken, currentUser;

    if (req && req.headers.authorization) {
        authToken = req.headers.authorization.split('Bearer ')[1];
    } else if (connection.Authorization) {
        authToken = connection.Authorization.split('Bearer ')[1];
    }

    if (authToken) {
        jwt.verify(authToken, process.env.JWT_SECRET, (err, decodeToken) => {
            currentUser = decodeToken;
        });
    }

    if (!currentUser && req) {
        if (req.body.operationName !== 'login' && req.body.operationName !== 'register') {
            throw new AuthenticationError('Unauthenticated');
        }
    }

    return {currentUser, pubsub};
}