import express from 'express';
import validate from 'express-validation';
import { authorize } from 'auth-adapter';
import permissions from '../../../../config/permissions';

import {
    listValidation,
    createValidation,
    updateValidation
} from '../../../validations/v1/price-book.validation';

import middleware from '../../../middlewares/price-book.middleware';
import controller from '../../../controllers/v1/price-book.controller';

const router = express.Router();

router
    .route('/')
    .get(
        validate(listValidation),
        authorize([permissions.PRICE_BOOK_LIST]),
        middleware.count,
        controller.list
    )
    .post(
        validate(createValidation),
        authorize([permissions.PRICE_BOOK_CREATE]),
        middleware.checkDuplicate,
        controller.create
    );

router
    .route('/:id')
    .get(
        authorize([permissions.PRICE_BOOK_LIST]),
        middleware.load,
        controller.detail
    )
    .put(
        validate(updateValidation),
        authorize([permissions.PRICE_BOOK_UPDATE]),
        middleware.load,
        controller.update
    )
    .delete(
        authorize([permissions.PRICE_BOOK_DELETE]),
        middleware.load,
        controller.delete
    );

export default router;
