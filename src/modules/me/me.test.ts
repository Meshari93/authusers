import axios from 'axios';
import { createTypeormConn } from '../../utils/createTypeormConn';
import { Connection } from 'typeorm';
import { User } from '../../entity/User';
import { TestClient } from '../../utils/TestClient';

let userId : string;
let conn: Connection;
const email = "almeshari93@gmail.com";
const password = "jlkajoioiqwe";

beforeAll(async () => {
  conn = await createTypeormConn();
  const user =  await User.create({
    email,
    password,
    confirmed: true
  }).save();
  userId = user.id;
});

afterAll(async () => {
  conn.close();
});


describe("me", () => {
    test("return null if no cookie", async () => {
        const client = new TestClient(process.env.TEST_HOST as string);
        const response = await client.me();
        expect(response.data.me).toBeNull();
    });
    
    test("get currrent user", async () => {
        const client = new TestClient(process.env.TEST_HOST as string);
        await client.login(email, password);
        const response = await client.me();  
        expect(response.data).toEqual({
            me: {
                id: userId,
                email
            }
        });
     });
});