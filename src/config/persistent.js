import { basename } from 'path';
import postgres from './postgres';
import mongoose from './mongoose';
import rabbitMQ from './rabbitmq';
import redis from './redis';

const isCriticalProcess = basename(process.mainModule.filename) === 'index.js';
const DELAY_TIME = 60000; // time to wait before kill process
let timeout;

/**
 * Error handle
 */
const errorHandler = (err, isCriticalConnection = false) => {
    if (err) {
        if (isCriticalProcess && !isCriticalConnection) {
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(() => {
                console.log(process.pid);
                process.kill(process.pid, 'SIGUSR1');
            }, DELAY_TIME);
            return null;
        }
        process.kill(process.pid, 'SIGUSR1');
    }
    return err;
};

/**
 * Disconnect to database
 */
const disconnect = async () => {
    try {
        await postgres.disconnect();
    } catch (error) {
        console.log(`postgres disconnect: ${error}`);
    }
    try {
        await mongoose.disconnect();
    } catch (error) {
        console.log(`mongoose disconnect: ${error}`);
    }
    try {
        await rabbitMQ.disconnect();
    } catch (error) {
        console.log(`rabbitMQ disconnect: ${error}`);
    }
    try {
        await redis.disconnect();
    } catch (error) {
        console.log(`redis disconnect: ${error}`);
    }
    await new Promise((s) => setTimeout(s, 100));
};

/**
 * Create connection to database
 */
const connect = async () => {
    try {
        await postgres.connect((err) => {
            console.log(`Connection to Postgres error: ${err}`);
            errorHandler(err);
        });
    } catch (error) {
        if (errorHandler(error)) {
            throw error;
        }
    }
    try {
        // Exit application on error
        await mongoose.connect((err) => {
            console.error(`MongoDB connection error: ${err}`);
            errorHandler(err, true);
        });
    } catch (error) {
        if (errorHandler(error, true)) {
            throw error;
        }
    }
    try {
        await rabbitMQ.connect(
            (err) => {
                console.log(`Connection to RabbitMQ error: ${err}`);
                errorHandler(err);
            },
            (err) => {
                console.log(`Connection to RabbitMQ closed: ${err}`);
                if (err) {
                    errorHandler(err);
                }
            }
        );
    } catch (error) {
        if (errorHandler(error)) {
            throw error;
        }
    }

    try {
        await redis.connect((err) => {
            console.log(`Connection to Redis error: ${err}`);
            errorHandler(err);
        });
    } catch (error) {
        if (errorHandler(error)) {
            throw error;
        }
    }
};

module.exports = {
    connect,
    disconnect
};
