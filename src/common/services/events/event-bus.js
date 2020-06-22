import { EventEmitter } from 'events';

const emitter = new EventEmitter();

emitter.on('uncaughtException', (err) => {
    console.error(err);
});

export default emitter;
