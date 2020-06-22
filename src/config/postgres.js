import Sequelize from 'sequelize';
import bluebird from 'bluebird';
import { postgres } from '../config/vars';

Sequelize.Promise = bluebird;

const defaultErrorHandler = (err) => {
    console.log(`Connection to Postgres error: ${err}`);
};

const app = {
    sequelize: null,
    connect(errorHandler = defaultErrorHandler) {
        if (!this.sequelize) {
            this.sequelize = new Sequelize(
                postgres.uri,
                {
                    dialect: 'postgres'
                }
            );
            this.sequelize.authenticate()
                .then(
                    () => {
                        console.log('Postgres connection established!');
                        // this.sequelize.sync({});
                    }
                )
                .catch(
                    ex => errorHandler(ex)
                );
        }
        return this.sequelize;
    },
    disconnect() {
        /** close connection */
        console.log('Closing postgres connection!');
        this.sequelize.close();
    }
};

export default app;
