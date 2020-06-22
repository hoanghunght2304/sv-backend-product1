import Redis from 'ioredis';
import bluebird from 'bluebird';
import { redis as redisConfig, serviceName } from './vars';

Redis.Promise = bluebird;

bluebird.promisifyAll(Redis);
bluebird.promisifyAll(Redis.prototype);

const defaultErrorHandler = (err) => {
    console.log(`Connection to Redis error: ${err}`);
};

const app = {
    client: null,
    subscriber: null,
    allClients: [],
    connect(errorHandler = defaultErrorHandler, overrideClient = true) {
        const client = new Redis(redisConfig.uri, {
            maxRetriesPerRequest: 3
        });

        client.on('ready', () => {
            console.log('Redis connection established!');
        });

        client.on('end', () => {
            console.log('Redis connection closed!');
        });

        client.on('error', errorHandler);
        if (overrideClient) {
            this.client = client;
        }
        this.allClients.push(client);
        return client;
    },
    disconnect() {
        this.allClients.forEach((client) => {
            if (client) {
                console.log('Closing redis connection!');
                client.quitAsync().catch(console.log);
            }
        });
        return null;
    },
    getJobOptions() {
        if (!this.subscriber) {
            this.subscriber = this.connect(undefined, false);
        }
        return {
            prefix: `jobs:${serviceName}`,
            defaultJobOptions: {
                removeOnComplete: 100,
                removeOnFail: 100
            },
            createClient: (type) => {
                switch (type) {
                    case 'client':
                        return this.client;
                    case 'subscriber':
                        return this.subscriber;
                    default:
                        return this.connect(undefined, false);
                }
            }
        };
    }
};

module.exports = app;
