import express from 'express';
import validate from 'express-validation';
import { authorize } from 'auth-adapter';

import controller from '../../../controllers/v1/product.controller';
import middleware from '../../../middlewares/product.middleware';
import permissions from '../../../../config/permissions';
import {
    listValidation,
    createValidation,
    updateValidation
} from '../../../validations/v1/product.validation';

const router = express.Router();

router
    .route('/')
    .get(
        validate(listValidation),
        authorize([permissions.ITEM_LIST]),
        middleware.count,
        controller.list
    )
    .post(
        validate(createValidation),
        authorize([permissions.ITEM_CREATE]),
        middleware.verify,
        controller.create
    );

router
    .route('/:id')
    .get(
        authorize([permissions.ITEM_DETAIL]),
        middleware.load,
        controller.detail
    )
    .put(
        validate(updateValidation),
        authorize([permissions.ITEM_UPDATE]),
        middleware.load,
        controller.update
    )
    .delete(
        authorize([permissions.ITEM_DELETE]),
        middleware.load,
        controller.delete
    );

export default router;
