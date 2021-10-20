const userResolvers = require('./users');
const messageResolvers = require('./messages');
const {Message, User} = require("../../models");

module.exports = {
    Message: {
        createdAt: (parent) => {
           return  parent.createdAt?.toISOString() || null
        }
    },
    Reaction: {
        createdAt: (parent) => parent.createdAt.toISOString(),
        message: async (parent) => await Message.findByPk(parent.messageId),
        user: async (parent) =>
            await User.findByPk(parent.userId, {
                attributes: ['username', 'imageUrl', 'createdAt'],
            }),
    },
    User: {
        createdAt: (parent) => parent.createdAt.toISOString()
    },
    Query: {
        ...userResolvers.Query,
        ...messageResolvers.Query
    },
    Mutation: {
        ...userResolvers.Mutation,
        ...messageResolvers.Mutation
    },
    Subscription: {
        ...messageResolvers.Subscription
    }
}