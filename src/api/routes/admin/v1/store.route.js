

import express from 'express';
import validate from 'express-validation';
import { authorize } from 'auth-adapter';

import controller from '../../../controllers/v1/store.controller';
import middleware from '../../../middlewares/store.middleware';
import permissions from '../../../../config/permissions';

import {
    listValidation,
    createValidation,
    updateValidation
} from '../../../validations/v1/store.validation';

const router = express.Router();

router
    .route('/')
    .get(
        validate(listValidation),
        authorize([permissions.STORE_LIST]),
        middleware.condition,
        middleware.count,
        controller.list
    )
    .post(
        validate(createValidation),
        authorize([permissions.STORE_CREATE]),
        middleware.checkDuplicate,
        controller.create
    );
router
    .route('/:id')
    .get(
        authorize([permissions.STORE_DETAIL]),
        middleware.load,
        controller.detail
    )
    .put(
        validate(updateValidation),
        authorize([permissions.STORE_UPDATE]),
        middleware.load,
        controller.update
    )
    .delete(
        authorize([permissions.STORE_DELETE]),
        middleware.load,
        controller.delete
    );

export default router;

