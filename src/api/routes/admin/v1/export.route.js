

import express from 'express';
import validate from 'express-validation';
import { authorize } from 'auth-adapter';

import controller from '../../../controllers/v1/export.controller';
import middleware from '../../../middlewares/export.middleware';
import permissions from '../../../../config/permissions';

import {
    listValidation,
    createValidation,
    processValidation,
    updateValidation,
    cancelValidation,
    returnValidation,
    confirmValidation
} from '../../../validations/v1/export.validation';

const router = express.Router();

router
    .route('/process')
    .get(
        validate(processValidation),
        middleware.filterConditions,
        middleware.countQueries,
        controller.listProcess
    );
router
    .route('/')
    .get(
        validate(listValidation),
        authorize([permissions.EXPORT_LIST]),
        middleware.count,
        controller.list
    )
    .post(
        validate(createValidation),
        authorize([permissions.EXPORT_CREATE]),
        controller.create
    );
router
    .route('/:id')
    .get(
        authorize([permissions.EXPORT_DETAIL]),
        middleware.load,
        controller.detail
    )
    .put(
        validate(updateValidation),
        authorize([permissions.EXPORT_UPDATE]),
        middleware.load,
        controller.update
    );

router
    .route('/cancel/:id')
    .post(
        validate(cancelValidation),
        authorize([permissions.EXPORT_UPDATE]),
        middleware.load,
        middleware.validateStatus,
        controller.cancel
    );
router
    .route('/return/:id')
    .post(
        validate(returnValidation),
        authorize([permissions.EXPORT_UPDATE]),
        middleware.load,
        middleware.validateStatus,
        controller.return
    );
router
    .route('/confirm/:id')
    .post(
        validate(confirmValidation),
        authorize([permissions.EXPORT_UPDATE]),
        middleware.load,
        middleware.validateStatus,
        controller.confirm
    );

export default router;

