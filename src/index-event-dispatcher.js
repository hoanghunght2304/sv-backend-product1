import eventDispatcher from './event-adapter';
import provider from './common/providers';
import persistent from './config/persistent';

persistent
    .connect()
    .then(() => {
        provider.register();
        eventDispatcher.register();
    })
    .catch((err) => {
        console.log(err);
        process.exit(-1);
    });

function terminate(exitCode) {
    return () => {
        persistent.disconnect().then(() => {
            process.exit(exitCode);
        });
    };
}

// handle close
process.on('SIGINT', terminate(0));
process.on('SIGTERM', terminate(0));
process.on('SIGUSR1', terminate(-1));
