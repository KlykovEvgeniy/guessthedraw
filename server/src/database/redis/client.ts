import { createClient, type RedisClientType } from 'redis';
import { config } from 'dotenv';
config();

const client: RedisClientType = createClient({
    socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT!),
    },
    username: process.env.REDIS_USER,
    password: process.env.REDIS_PASSWORD
});

export async function connectClient() {
    if(!client.isOpen) {
        await client.connect();
    }
    return client;
}