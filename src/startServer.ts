import "reflect-metadata";
import "dotenv/config";

import { GraphQLServer } from "graphql-yoga";
import * as session from "express-session";
import * as connectRedis from "connect-redis";
import * as RateLimit from "express-rate-limit";
import * as RateLimitRedisStore from "rate-limit-redis";

import { redis } from "./redis";
import { createTypeormConn } from "./utils/createTypeormConn";
import { confirmEmail } from "./routes/confirmEmail";
import { genSchema } from "./utils/genSchema";
import { redisSessionPrefix } from "./constants";
 

const SESSION_SECRET = "asdsad";
const RedisStore = connectRedis(session);

export const startServer = async () => {
  const server = new GraphQLServer({ 
    schema: genSchema(),
    context: ({request}) => ({
      redis, 
      url: request.protocol + "://" + request.get("host"),
      session: request.session,
      req: request
    })
  });

  server.express.use(
    new RateLimit({
      store: new RateLimitRedisStore({
        client: redis,
      }),
      windowMs: 15*60*1000, //15 minutes
      max: 100, //limit each IP to 100 requests per windoMs
      delayMs: 0 // disable delaing - full speed unil the max limit is reached
    })
  );

  server.express.use(
    session({
      store: new RedisStore({
        client: redis as any,
        prefix: redisSessionPrefix
      }),
      name: "qid",
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
      }
    })
  );

  const cors = {
    credentials: true,
    origin:process.env.NODE_ENV === "test" ? "*" : process.env.FRONTEND_HOST as string
  };

  server.express.get("/confirm/:id", confirmEmail)
  
  await createTypeormConn();
  const app = await server.start({
    cors,
     port: process.env.NODE_ENV === "test" ? 0 : 4000 
  });
  console.log('Server is running on http://localhost:4000');

  return app;


};