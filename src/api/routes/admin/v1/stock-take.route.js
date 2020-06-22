

import express from 'express';
import validate from 'express-validation';
import { authorize } from 'auth-adapter';

import controller from '../../../controllers/v1/stock-take.controller';
import middleware from '../../../middlewares/stock-take.middleware';
import permissions from '../../../../config/permissions';

import {
    listValidation,
    createValidation,
    cancelValidation,
    confirmValidation
} from '../../../validations/v1/stock-take.validation';

const router = express.Router();

router
    .route('/')
    .get(
        validate(listValidation),
        authorize([permissions.STOCK_TAKE_LIST]),
        middleware.count,
        controller.list
    )
    .post(
        validate(createValidation),
        authorize([permissions.STOCK_TAKE_CREATE]),
        controller.create
    );

router
    .route('/:id')
    .get(
        authorize([permissions.STOCK_TAKE_DETAIL]),
        middleware.load,
        controller.detail
    )
    .put(
        authorize([permissions.STOCK_TAKE_UPDATE]),
        middleware.load,
        controller.update
    );

router
    .route('/cancel/:id')
    .post(
        validate(cancelValidation),
        authorize([permissions.STOCK_TAKE_CANCEL]),
        middleware.load,
        middleware.validateStatus,
        controller.cancel
    );
router
    .route('/confirm/:id')
    .post(
        validate(confirmValidation),
        authorize([permissions.STOCK_TAKE_CONFIRM]),
        middleware.load,
        middleware.validateStatus,
        controller.confirm
    );

export default router;

