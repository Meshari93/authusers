import { Redis } from "ioredis";
export interface Session {
    userId?: string;
};

export interface ResolverMap  {
    [Key: string]: {
        [Key: string]: (parent: any, args: any, context: {
            redis: Redis;
            url: string;    
            session: Session;
        }, info: any) => any;
    };
}

