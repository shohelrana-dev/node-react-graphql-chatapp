const {UserInputError, AuthenticationError} = require('apollo-server-express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {Op} = require('sequelize');
const {User, Message} = require('../../models');
const db = require('../../models/index');

module.exports = {
    Query: {
        getUsers: async (_, __, {currentUser}) => {
            try {
                let sql = `Select users.*, (Select messages.id from messages where messages.from = users.username OR messages.to = users.username order by messages.createdAt desc limit 1) as lastMessage from users WHERE username != '${currentUser.username}' ORDER BY lastMessage DESC`;
                let users = await db.sequelize.query(sql);
                users = await Promise.all(users[0].map(async user=>{
                    if(user.lastMessage){
                        user.lastMessage = await Message.findByPk(user.lastMessage);
                    }
                    return user;
                }))
                return users;
            } catch (err) {
                console.log(err)
                throw err;
            }
        },
        login: async (_, {username, password}) => {
            let errors = {};
            try {
                //validate input data
                if (username.trim() === '') errors.username = 'Username must not be empty';
                if (password === '') errors.password = 'Password must not be empty';

                if (Object.keys(errors).length > 0) {
                    if (Object.keys(errors).length > 0) {
                        throw new UserInputError('Bad input', {errors});
                    }
                }

                //fetch user from db
                let user = await User.findOne({
                    where: {username}
                });
                //check found user
                if (!user) {
                    errors.username = 'User was not found';
                    throw new UserInputError('User not found', {errors});
                }

                //check is valid password
                let isValidPassword = await bcrypt.compare(password, user.password);
                if (!isValidPassword) {
                    errors.password = 'password is incorrect';
                    throw new AuthenticationError('password is incorrect', {errors});
                }

                let userObject = {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    imageUrl: user.imageUrl
                };
                const token = jwt.sign(userObject, process.env.JWT_SECRET, {expiresIn: 60 * 60 * 24});
                user.token = token;
                return {
                    ...user.toJSON(),
                    createdAt: user.createdAt,
                    token
                };
            } catch (err) {
                console.log(err);
                throw err;
            }
        }
    },
    Mutation: {
        register: async (parent, args) => {
            let {username, email, password, confirmPassword} = args;
            let errors = {};

            try {
                //validate input data
                if (username.trim() === '') errors.username = 'Username must not be empty';
                if (email.trim() === '') errors.email = 'Email must not be empty';
                if (password === '') errors.password = 'Password must not be empty';
                if (confirmPassword.trim() === '') errors.confirmPassword = 'ConfirmPassword must not be empty';
                if (password !== confirmPassword) errors.confirmPassword = 'Passwords must match';

                //check if username or  email exists
                let userByUsername = await User.findOne({where: {username}});
                let userByEmail = await User.findOne({where: {email}});

                if (userByUsername) errors.username = 'Username already taken';
                if (userByEmail) errors.email = 'Email already taken';

                if (Object.keys(errors).length > 0) {
                    throw  errors;
                }

                //make hash password
                password = await bcrypt.hash(password, 6);

                //create user
                let createdUser = await User.create({
                    username, email, password
                });

                //return user
                return createdUser;
            } catch (err) {
                if (err.name === 'SequelizeUniqueConstraintError') {
                    err.errors.forEach((e) => {
                        errors[e.path.replace('users.', '')] = `${e.path.replace('users.', '')} already taken`;
                    })
                } else if (err.name === 'SequelizeValidationError') {
                    err.errors.forEach((e) => {
                        errors[e.path] = e.message;
                    })
                }
                console.log(err)
                throw new UserInputError('Bad request', {errors})
            }
        }
    }
}