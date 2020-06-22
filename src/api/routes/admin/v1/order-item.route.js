import express from 'express';
import validate from 'express-validation';
import { authorize } from 'auth-adapter';

import controller from '../../../controllers/v1/order-item.controller';
import middleware from '../../../middlewares/order-item.middleware';
import permissions from '../../../../config/permissions';

import {
    listItemsValidation,
    detailItemValidation,
    assignValidation,
    processValidation
} from '../../../validations/v1/order-item.validation';

const router = express.Router();

router
    .route('/')
    .get(
        validate(listItemsValidation),
        authorize([permissions.ORDER_LIST]),
        middleware.count,
        controller.list
    );

router
    .route('/:orderId')
    .get(
        validate(detailItemValidation),
        authorize([permissions.ORDER_LIST]),
        middleware.load,
        controller.detail
    );

router
    .route('/assign/:orderId')
    .post(
        validate(assignValidation),
        authorize([permissions.ORDER_UPDATE]),
        middleware.load,
        middleware.validateStatus,
        controller.assign
    );

router
    .route('/change-process')
    .post(
        validate(processValidation),
        authorize([permissions.ORDER_UPDATE]),
        controller.changeProcess
    );

export default router;
