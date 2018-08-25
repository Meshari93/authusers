import { User } from '../../entity/User';
import { duplicateEmail, emailNotLongEnough, invalidEmail, passwordNotLongEnough } from './errorMessages';
import { createTypeormConn } from '../../utils/createTypeormConn';
import { Connection } from "typeorm";
import { TestClient } from '../../utils/TestClient';


const email = "meshari3@gmail.com";
const password = "12345";
 
let conn: Connection;
beforeAll(async () => {
    conn = await createTypeormConn();
});

afterAll(async () => {
    conn.close();
});

describe("Register user", async () => {
    it("check for duplicate emails", async () => {
        const client = new TestClient(process.env.TEST_HOST as string);
        // make sure we can register a user 
        const response = await client.register(email, password);

        expect(response.data).toEqual({ register: null });
        const users = await User.find({ where: { email } });
        expect(users).toHaveLength(1);
        const user = users[0];
        expect(user.email).toEqual(email);
        expect(user.password).not.toEqual(password);
        
        // test for dulicate emails
        const response2 = await client.register(email, password);        
        expect (response2.data.register).toHaveLength(1);
        expect (response2.data.register[0]).toEqual({
            path: "email",
            message: duplicateEmail
        });
    });
    it("check bad email", async () => {
        const client = new TestClient(process.env.TEST_HOST as string);
        const response3 = await client.register("b", password);
        expect(response3.data).toEqual({
            register: [
            {
                    path: "email",
                message: emailNotLongEnough
            },
            {
                path: "email",
                message: invalidEmail
            }
            ]
        });

    });
    it("catch bad password", async () =>  {
        //catch bad password
        const client = new TestClient(process.env.TEST_HOST as string);
        const response4 = await client.register(email, "12");
     expect(response4.data).toEqual({
        register: [
           {
                path: "password",
               message: passwordNotLongEnough
           },
 
        ]
    });
    });

    it("catch bad password and bad email", async () => {
        const client = new TestClient(process.env.TEST_HOST as string);
        const response5 = await client.register("me", "12");
        expect(response5.data).toEqual({
                register: [              
                    {
                         path: "email",
                        message: emailNotLongEnough
                    },
                    {
                        path: "email",
                        message: invalidEmail
                    },
                    {
                        path: "password",
                        message: passwordNotLongEnough
                    }
     
            ]
        });
    });
 });