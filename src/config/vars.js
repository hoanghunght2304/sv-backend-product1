const path = require('path');

// import .env variables
require('dotenv-safe').load({
    path: path.join(__dirname, '../../.env'),
    sample: path.join(__dirname, '../../.env.example')
});

module.exports = {
    serviceName: 'dunnio_erp_product_service',
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    postgres: {
        uri: process.env.NODE_ENV === 'production' ? process.env.POSTGRES_URI : process.env.POSTGRES_URI_TEST
    },
    mongo: {
        uri: process.env.NODE_ENV === 'production' ? process.env.MONGO_URI : process.env.MONGO_URI_TEST
    },
    rabbit: {
        uri: process.env.RABBITMQ_URI
    },
    redis: {
        uri: process.env.REDIS_URI
    },
    logs: process.env.NODE_ENV === 'production'
        ? 'combined'
        : 'development',
    otherServices: {
        manager: process.env.MANAGER_SERVICE_URL,
        image: process.env.IMAGE_SERVICE_URL
    },
    thirdPartyServices: {
        facebookAuth: {
            appId: 'appId',
            appToken: 'appToken',
            accountkitAppSecret: 'accountkitAppSecret'
        }
    }
};
