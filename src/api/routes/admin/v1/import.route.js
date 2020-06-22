

import express from 'express';
import validate from 'express-validation';
import { authorize } from 'auth-adapter';

import controller from '../../../controllers/v1/import.controller';
import middleware from '../../../middlewares/import.middleware';
import permissions from '../../../../config/permissions';

import {
    listValidation,
    createValidation,
    updateValidation,
    cancelValidation,
    confirmValidation
} from '../../../validations/v1/import.validation';

const router = express.Router();

router
    .route('/')
    .get(
        validate(listValidation),
        authorize([permissions.IMPORT_LIST]),
        middleware.count,
        controller.list
    )
    .post(
        validate(createValidation),
        authorize([permissions.IMPORT_CREATE]),
        controller.create
    );

router
    .route('/:id')
    .get(
        authorize([permissions.IMPORT_DETAIL]),
        middleware.load,
        controller.detail
    )
    .put(
        validate(updateValidation),
        authorize([permissions.IMPORT_UPDATE]),
        middleware.load,
        controller.update
    );

router
    .route('/cancel/:id')
    .post(
        validate(cancelValidation),
        authorize([permissions.IMPORT_UPDATE]),
        middleware.load,
        middleware.validateStatus,
        controller.cancel
    );
router
    .route('/confirm/:id')
    .post(
        validate(confirmValidation),
        authorize([permissions.IMPORT_UPDATE]),
        middleware.load,
        middleware.validateStatus,
        controller.confirm
    );
export default router;

