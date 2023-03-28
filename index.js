import bodyParser from 'body-parser'
import cors from 'cors';
import express from 'express';
import fs from 'fs'
import { gql, ApolloServer } from 'apollo-server-express'
const typeDefs = gql(fs.readFileSync('./graphql/typeDefs/schema.graphql', { encoding: 'utf8' }))
import resolvers from './graphql/resolvers/resolvers.js'
const PORT = 9000;

async function startApolloServer(typeDefs, resolvers) {
  const server = new ApolloServer({ typeDefs, resolvers })
  const app = express();

  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  app.use(cors(), bodyParser.json());


  app.listen(PORT, () => {
    console.log(`Server is listening on port http://localhost:${PORT}${server.graphqlPath}`);
  })
}

startApolloServer(typeDefs, resolvers);