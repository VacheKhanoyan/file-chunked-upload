const { ApolloServer, gql } = require("apollo-server-express");
const {
  createWriteStream,
  existsSync,
  mkdirSync,
  ReadStream,
  writeFile,
} = require("fs");
var stream = require("stream");
const path = require("path");
const express = require("express");

const files = [];
const filesObj = {};

const typeDefs = gql`
  type Query {
    upload: Boolean
  }
  type Mutation {
    uploadFile(file: Upload!): Boolean
  }
`;

const resolvers = {
  Query: {
    upload: ()=>true,
  },
  Mutation: {
    uploadFile: async (_, { file }) => {
      const { chunk, chunkId, chunkProgress, sumUp = 0, filename, type } = await file;
      const { createReadStream } = await chunk;
      console.log("1122", chunk);
      if (!(chunkId in filesObj)) {
        filesObj[chunkId] = [];
      }
      const readStream = createReadStream(`${chunkId}`, { highWaterMark: 5 });
      
      const chunks = [];
      readStream
        .on("data", (chunk) => {
          chunks.push(chunk);
        })
        .on("end", () => {
          filesObj[chunkId].push(Buffer.concat(chunks));
          writeFile(
            path.join(__dirname, "../images", `${chunkId}.${type}`),
            Buffer.concat(filesObj[chunkId]),
            () => {
              console.log('end');
            }
          );
        });

      return true;
    },
  },
};

existsSync(path.join(__dirname, "../images")) ||
  mkdirSync(path.join(__dirname, "../images"));

const server = new ApolloServer({ typeDefs, resolvers });
const app = express();
app.use("/images", express.static(path.join(__dirname, "../images")));
server.applyMiddleware({ app });

app.listen(4000, () => {
  console.log(`🚀  Server ready at http://localhost:4000/`);
});
