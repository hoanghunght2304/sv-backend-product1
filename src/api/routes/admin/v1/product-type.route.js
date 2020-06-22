import express from 'express';
import validate from 'express-validation';
import { authorize } from 'auth-adapter';
import permissions from '../../../../config/permissions';

import {
    listValidation,
    createValidation,
    updateValidation
} from '../../../validations/v1/product-type.validation';

import middleware from '../../../middlewares/product-type.middleware';
import controller from '../../../controllers/v1/product-type.controller';

const router = express.Router();

router
    .route('/')
    .get(
        validate(listValidation),
        authorize([permissions.MATERIAL_TYPE_LIST]),
        middleware.condition,
        controller.list
    )
    .post(
        validate(createValidation),
        authorize([permissions.MATERIAL_TYPE_CREATE]),
        middleware.checkDuplicate,
        controller.create
    );

router
    .route('/:id')
    .get(
        authorize([permissions.MATERIAL_TYPE_DETAIL]),
        middleware.load,
        controller.detail
    )
    .put(
        validate(updateValidation),
        authorize([permissions.MATERIAL_TYPE_UPDATE]),
        middleware.load,
        controller.update
    )
    .delete(
        authorize([permissions.MATERIAL_TYPE_DELETE]),
        middleware.load,
        controller.delete
    );

export default router;
