import { request } from 'graphql-request';
  
import { User } from '../../entity/User';
import { duplicateEmail, emailNotLongEnough, invalidEmail, passwordNotLongEnough } from './errorMessages';
import { createTypeormConn } from '../../utils/createTypeormConn';
import { Connection } from "typeorm";


const email = "meshari3@gmail.com";
const password = "12345";

const mutation = (e: string, p: string) => `
    mutation {
        register(email: "${e}", password: "${p}") {
            path
            message
        }
  }`;

let conn: Connection;
beforeAll(async () => {
    conn = await createTypeormConn();
});

afterAll(async () => {
    conn.close();
});

describe("Register user", async () => {
    it("check for duplicate emails", async () => {
        // make sure we can register a user 
        const response = await request(process.env.TEST_HOST as string,mutation(email, password) );
        expect(response).toEqual({ register: null });
        const users = await User.find({ where: { email } });
        expect(users).toHaveLength(1);
        const user = users[0];
        expect(user.email).toEqual(email);
        expect(user.password).not.toEqual(password);
        
        // test for dulicate emails
        const response2: any = await request(process.env.TEST_HOST as string,mutation(email, password));
        expect (response2.register).toHaveLength(1);
        expect (response2.register[0]).toEqual({
            path: "email",
            message: duplicateEmail
        });
    });
    it("check bad email", async () => {
         const response3: any = await request(process.env.TEST_HOST as string,mutation("m",password));
        expect(response3).toEqual({
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
        const response4: any = await request(process.env.TEST_HOST as string,mutation(email,"12"));
    expect(response4).toEqual({
        register: [
           {
                path: "password",
               message: passwordNotLongEnough
           },
 
        ]
    });
    });
    it("catch bad password and bad email", async () => {
        const response5: any = await request(process.env.TEST_HOST as string,mutation("me","12"));
        expect(response5).toEqual({
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