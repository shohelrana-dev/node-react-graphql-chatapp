//external import
require('dotenv').config();
const express = require( 'express');
const { ApolloServer }  = require( 'apollo-server-express');
const { createServer } = require( 'http');
const { execute, subscribe } = require( 'graphql');
const { SubscriptionServer } = require( 'subscriptions-transport-ws');
const {makeExecutableSchema} = require("@graphql-tools/schema");
const { ApolloServerPluginLandingPageGraphQLPlayground } = require('apollo-server-core');


//internal import
const typeDefs = require('./src/graphql/typeDefs');
const resolvers = require('./src/graphql/resolvers/index');
const contextMiddleware = require("./src/util/contextMiddleware");

//bootstrap the app
async function bootstrap() {
    const app = express();
    app.use(express.static(__dirname + '/client/build'));

    const schema = makeExecutableSchema({
        typeDefs, resolvers
    });

    const apolloServer = new ApolloServer({
        schema,
        context: contextMiddleware,
        plugins: [
            ApolloServerPluginLandingPageGraphQLPlayground
        ]
    });
    await apolloServer.start();

    apolloServer.applyMiddleware({ app });
    const httpServer = createServer(app);

    SubscriptionServer.create({
        execute,
        subscribe,
        schema,
        onConnect: (connection) => contextMiddleware({connection})
    }, {
        server: httpServer,
        path: apolloServer.graphqlPath,
    });

    httpServer.listen(process.env.PORT, () => {
        console.log(`Server ready at http://localhost:${process.env.PORT}`);
    });
}

//call bootstrap function
bootstrap();
