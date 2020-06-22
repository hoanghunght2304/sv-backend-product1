import rabbitEventSource from 'rabbit-event-source';
import { rabbit, env } from './vars';

const defaultErrorHandler = (err) => {
    console.log(`Connection to Rabbit error: ${err}`);
};

const defaultCloseHandler = (err) => {
    console.log(`Connection to Rabbit closed: ${err}`);
};

const connect = async (
    errorHandler = defaultErrorHandler,
    closeHandler = defaultCloseHandler
) => {
    await rabbitEventSource.init(rabbit.uri, env);

    rabbitEventSource.rabbit.connection.on('error', errorHandler);
    rabbitEventSource.rabbit.connection.on('close', closeHandler);
};

const disconnect = rabbitEventSource.rabbit.close.bind(
    rabbitEventSource.rabbit
);

module.exports = {
    connect,
    disconnect
};
