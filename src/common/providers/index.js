import eventSource from './event-source';

export default {
    register: () => {
        // register any event emitter || event rabbitmq here
        eventSource.register();
    }
};
