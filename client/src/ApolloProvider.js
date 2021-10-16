import React from 'react'
import {
    ApolloClient,
    InMemoryCache,
    ApolloProvider as Provider,
    createHttpLink,
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context';
import { WebSocketLink } from '@apollo/client/link/ws';
import { split } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';

let httpLink = createHttpLink({
    uri: process.env.REACT_APP_GRAPHQL_URL,
})

const authLink = setContext((_, { headers }) => {
   return {
        headers: {
            ...headers,
            authorization: `Bearer ${localStorage.getItem('auth-token')}`
        },
    }
});

httpLink = authLink.concat(httpLink);

const wsLink = new WebSocketLink({
  uri: process.env.REACT_APP_GRAPHQL_WS_URL,
  options: {
    reconnect: true,
    connectionParams: {
        Authorization: `Bearer ${localStorage.getItem('auth-token')}`
    }
  }
});

const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wsLink,
    httpLink,
  );

const client = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
})

export default function ApolloProvider(props) {
    return <Provider client={client} {...props} />
}