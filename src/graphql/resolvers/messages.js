const {UserInputError, ForbiddenError} = require('apollo-server-express');
const {Op} = require('sequelize');
const {User, Message, Reaction} = require('../../models');
const {withFilter} = require('graphql-subscriptions');

module.exports = {
    Query: {
        getMessages: async (parent, {from}, {currentUser}) => {
            try {
                if (!from) throw new UserInputError('Participant user not found');

                const otherUser = await User.findOne({
                    where: {username: from}
                })
                if (!otherUser) throw new UserInputError('User not found');

                const usernames = [currentUser.username, otherUser.username];

                return await Message.findAll({
                    where: {
                        from: {[Op.in]: usernames},
                        to: {[Op.in]: usernames}
                    },
                    order: [['createdAt', 'DESC']],
                    include: [{model: Reaction, as: 'reactions'}]
                });
            } catch (err) {
                throw err;
            }
        }
    },
    Mutation: {
        sendMessage: async (parent, {to, content}, {currentUser, pubsub}) => {
            try {
                const recipient = await User.findOne({
                    where: {username: to}
                })

                if (!recipient) {
                    throw new UserInputError('User not found');
                } else if (recipient.username === currentUser.username) {
                    throw new UserInputError("You can't message yourself");
                }

                if (content.trim() === '') {
                    throw new UserInputError('Message is empty');
                }

                const savedMessage = await Message.create({
                    from: currentUser.username,
                    to,
                    content
                });

                await pubsub.publish('NEW_MESSAGE', {newMessage: savedMessage});

                return savedMessage;
            } catch (err) {
                throw err;
            }
        },
        reactToMessage: async (parent, {uuid, content}, {currentUser, pubsub}) => {
            try {
                const reactions = ['❤️', '😆', '😯', '😢', '😡', '👍', '👎']
                //validate reaction code
                if (!reactions.includes(content)) {
                    throw new UserInputError('Invalid reaction');
                }
                //check Authentication
                if (!currentUser) throw new AuthenticationError('Unauthenticated');

                //get message
                const message = await Message.findOne({where: {uuid}});
                if (!message) throw new UserInputError('message not found');

                if (message.from !== currentUser.username && message.to !== currentUser.username) {
                    throw new ForbiddenError('Unauthorized');
                }

                let reaction = await Reaction.findOne({
                    where: {messageId: message.id, userId: currentUser.id}
                });

                if (reaction) {
                    //Reaction exists update it
                    reaction.content = content;
                    await reaction.save();
                }else {
                    //Reaction does not exist create it
                    reaction = await Reaction.create({
                        messageId: message.id,
                        userId: currentUser.id,
                        content
                    });
                }

                await pubsub.publish('NEW_REACTION', {newReaction: reaction});

                return reaction;

            } catch (err) {
                throw err;
            }
        }
    },
    Subscription: {
        newMessage: {
            subscribe: withFilter((_, __, {currentUser, pubsub}) => {
                return pubsub.asyncIterator(['NEW_MESSAGE']);
            }, ({newMessage}, _, {currentUser}) => {
                return newMessage.from === currentUser.username || newMessage.to === currentUser.username;
            })
        },
        newReaction: {
            subscribe: withFilter((_, __, {currentUser, pubsub}) => {
                return pubsub.asyncIterator(['NEW_REACTION']);
            }, async ({newReaction}, _, {currentUser}) => {
                const message = await newReaction.getMessage();
                return message.from === currentUser.username || message.to === currentUser.username;
            })
        }
    }

}