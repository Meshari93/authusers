import * as  Redis  from 'ioredis';
import fetch from 'node-fetch';
import { Connection } from "typeorm";

import { createConfirmEmailLink } from "./createConfirmEmailLink";
import { createTypeormConn } from "./createTypeormConn";
import { User } from "../entity/User";
 
let userId = "";
const redis = new Redis();

let conn: Connection;

beforeAll(async () => {
  conn = await createTypeormConn();
  const user = await User.create({
    email: "almeshari93@gmail.com",
    password: "jlkajoioiqwe"
  }).save();
  userId = user.id;
});

afterAll(async () => {
  conn.close();
});


test("Make sure it confirms user and clears key in redis", async () =>{
const url = await createConfirmEmailLink(
    process.env.TEST_HOST as string,
    userId,
    redis,
);

const response = await fetch(url); 
const text = await response.text();
expect(text).toEqual("ok");
const user = await User.findOne({where: {id: userId } });
expect((user as User).confirmed).toBeTruthy();
const chunks = url.split('/');
const key = chunks[chunks.length - 1];   
const value = await redis.get(key);
expect(value).toBeNull();
// console.log(text);
});