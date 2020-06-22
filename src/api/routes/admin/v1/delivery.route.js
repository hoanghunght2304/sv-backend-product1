import express from 'express';
import validate from 'express-validation';
import { authorize } from 'auth-adapter';

import controller from '../../../controllers/v1/delivery.controller';
import middleware from '../../../middlewares/delivery.middleware';
import permissions from '../../../../config/permissions';

import {
    createValidation
} from '../../../validations/v1/delivery.validation';

const router = express.Router();

router
    .route('/')
    .post(
        validate(createValidation),
        authorize([permissions.ORDER_UPDATE]),
        middleware.prepareOrder,
        controller.create
    );

export default router;
