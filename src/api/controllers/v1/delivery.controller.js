import { pick } from 'lodash';

import messages from '../../../config/messages';
import { handler as ErrorHandler } from '../../middlewares/errors';
import Delivery from '../../../common/models/delivery.model';


/**
 * Create
 *
 * @public
 * @param {*} body
 * @returns {Promise<Delivery>, APIException>}
 */
exports.create = (req, res, next) => {
    const { products } = req.body;
    req.body.created_by = pick(
        req.user,
        ['id', 'name']
    );
    Delivery.create(
        req.body,
        { products }
    ).then(data => {
        res.json({
            message: messages.CREATE_SUCCESS,
            data: Delivery.transform(data)
        });
    }).catch(ex => {
        ErrorHandler(ex, req, res, next);
    });
};
