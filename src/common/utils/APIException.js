const httpStatus = require('http-status');

/**
 * @extends Error
 */
class ExtendableError extends Error {
    constructor({ message, errors, status, isPublic, stack, isTranslated }) {
        super(message);
        this.name = this.constructor.name;
        this.message = message;
        this.errors = errors;
        this.status = status;
        this.isPublic = isPublic;
        this.isOperational = true; // This is required since bluebird 4 doesn't append it anymore.
        this.stack = stack;
        this.isTranslated = isTranslated;
        // Error.captureStackTrace(this, this.constructor.name);
    }
}

/**
 * Class representing an API error.
 * @extends ExtendableError
 */
class APIException extends ExtendableError {
    /**
     * Create an API error.
     * @param {string} message - Error message.
     * @param {number} status - HTTP status code of error.
     * @param {boolean} isPublic - Whether the message should be visible to user or not.
     */
    constructor({
        message,
        errors,
        stack,
        status = httpStatus.INTERNAL_SERVER_ERROR,
        isPublic = false,
        isTranslated = false
    }) {
        super({
            message,
            errors,
            status,
            isPublic,
            stack,
            isTranslated
        });
    }
}

module.exports = APIException;
