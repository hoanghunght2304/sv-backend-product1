import express from 'express';
import morgan from 'morgan';
import { json, urlencoded } from 'body-parser';
import compress from 'compression';
import methodOverride from 'method-override';
import cors from 'cors';
import helmet from 'helmet';
import i18n from './i18n';
import { logs } from './vars';
import { converter, notFound, handler } from '../api/middlewares/errors';

// Routes
import adminRoutes from '../api/routes/admin/v1';

/**
 * Express instance
 * @public
 */
const app = express();

// request logging. dev: console | production: file
app.use(morgan(`${logs}`));

// parse body params and attache them to req.body
app.use(json());
app.use(urlencoded({ extended: true }));

// gzip compression
app.use(compress());

// lets you use HTTP verbs such as PUT or DELETE
// in places where the client doesn't support it
app.use(methodOverride());

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

// init i18n
app.use(i18n.init);

// mount api v1 routes
app.use('/admin/v1', adminRoutes);

// if error is not an instanceOf APIError, convert it.
app.use(converter);

// catch 404 and forward to error handler
app.use(notFound);

// error handler, send stacktrace only during development
app.use(handler);

export default app;
