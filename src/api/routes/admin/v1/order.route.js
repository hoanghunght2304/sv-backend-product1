import express from 'express';
import validate from 'express-validation';
import { authorize } from 'auth-adapter';

import controller from '../../../controllers/v1/order.controller';
import middleware from '../../../middlewares/order.middleware';
import permissions from '../../../../config/permissions';

import {
    listValidation,
    createValidation,
    updateValidation,
    confirmValidation,
    cancelValidation,
    paymentValidation
} from '../../../validations/v1/order.validation';

const router = express.Router();

router
    .route('/')
    .get(
        validate(listValidation),
        authorize([permissions.ORDER_LIST]),
        middleware.count,
        controller.list
    )
    .post(
        validate(createValidation),
        authorize([permissions.ORDER_LIST]),
        middleware.prepareOrder,
        controller.create
    );

router
    .route('/:id')
    .get(
        authorize([permissions.ORDER_DETAIL]),
        middleware.load,
        controller.detail
    )
    .put(
        validate(updateValidation),
        authorize([permissions.ORDER_UPDATE]),
        middleware.load,
        controller.update
    );

router
    .route('/confirm/:id')
    .post(
        validate(confirmValidation),
        authorize([permissions.ORDER_UPDATE]),
        middleware.load,
        middleware.checkConfirm,
        controller.confirm
    );

router
    .route('/cancel/:id')
    .post(
        validate(cancelValidation),
        authorize([permissions.ORDER_UPDATE]),
        middleware.load,
        middleware.checkCancel,
        controller.cancel
    );

router
    .route('/payment/:id')
    .post(
        validate(paymentValidation),
        authorize([permissions.ORDER_UPDATE]),
        middleware.load,
        middleware.checkPayment,
        controller.payment
    );

export default router;
