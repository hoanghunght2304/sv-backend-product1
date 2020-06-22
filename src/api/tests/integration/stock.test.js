/* eslint-disable no-undef */
/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-expressions */
import { Op } from 'sequelize';
import request from 'supertest';
import httpStatus from 'http-status';
import { expect } from 'chai';
import { omit } from 'lodash';
import app from '../../../index';
import Stock from '../../../common/models/stock-take.model';
import StockDetail from '../../../common/models/stock-detail.model';
import Inventory from '../../../common/models/inventory.model';

const token = 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InNoYWR5bG92ZSIsInBob25lIjoiMDk4ODg4ODg4OCIsImVtYWlsIjoiZW1haWxAZ21haWwuY29tIiwibmFtZSI6Ik5ndXnhu4VuIFbEg24gVGjDoG5oIiwiYXZhdGFyIjoiL3N0b3JhZ2VzL2F2YXRhci9kZWZhdWx0LmpwZyIsImV4cCI6MTU5MjM1NzMzNCwiaWF0IjoxNTkyMjcwOTM0LCJhdWQiOiJ3ZWIiLCJpc3MiOiJhdXRoLmR1eW5ndXllbnRhaWxvci5jb20vdXNlci93ZWIifQ.ezAoaLe9jvKKolsM_Sp-BIFAuKzxBjSJxlCaOiyLrZ6k7hHVWQfYi-5VeTuH8eco-ZoFBkJoTIEcqg9CFbJZ295nl6P_NVPy_Gk6_NBOaG0rus74yYOJ_atZDmgIi4qif4p9h1rXoEgdRvNL9JULG7_3lyxe6wi6DeHDqRTYpHSYZlZ0KDRndsNRGgRJIrbBFRQRVte129ZBBqUi-MJgGwsZ5Qndz_kzCdJnt-JHFBIVHh7xpfuN5ZIIBw2EjtZz2ktnu2lz7NMYTsp0SCuhym1oceNy9a66xpwZvDtxwL6xhDclHJZPp4qS9bPKhb75eNu8mflHuezsXWNHbqyoFQ';
describe('stock API', async () => {
    let records;
    let newRecord;

    beforeEach(async () => {
        records = [
            {
                id: '1000',
                note: 'Kiem kho lan 1',
                store: {
                    id: 'DT1',
                    name: 'Duy Nguyen 2',
                    phone: '0987667892',
                    address: 'Sô 2,Hoang Quốc Việt,HN'
                },
                total_quantity: 0,
                total_actual: 20,
                total_adjustment: 20,
                items: [
                    {
                        id: 'SP002',
                        total_quantity: 0,
                        total_actual: 10,
                        total_adjustment: 10,
                        total_price: 75000
                    },
                    {
                        id: 'SP003',
                        total_quantity: 0,
                        total_actual: 10,
                        total_adjustment: 10,
                        total_price: 75000
                    }
                ]
            },
            {
                id: '1001',
                note: 'Kiem kho lan 2',
                store: {
                    id: 'DT1',
                    name: 'Duy Nguyen 2',
                    phone: '0987667892',
                    address: 'Sô 2,Hoang Quốc Việt,HN'
                },
                total_quantity: 0,
                total_actual: 20,
                total_adjustment: 20,
                items: [
                    {
                        id: 'SP002',
                        total_quantity: 0,
                        total_actual: 10,
                        total_adjustment: 10,
                        total_price: 75000
                    },
                    {
                        id: 'SP001',
                        total_quantity: 0,
                        total_actual: 10,
                        total_adjustment: 10,
                        total_price: 75000
                    }
                ]
            },
            {
                id: '1002',
                note: 'Kiem kho lan 3',
                store: {
                    id: 'DT1',
                    name: 'Duy Nguyen 2',
                    phone: '0987667892',
                    address: 'Sô 2,Hoang Quốc Việt,HN'
                },
                total_quantity: 0,
                total_actual: 20,
                total_adjustment: 20,
                items: [
                    {
                        id: 'SP001',
                        total_quantity: 0,
                        total_actual: 10,
                        total_adjustment: 10,
                        total_price: 75000
                    },
                    {
                        id: 'SP003',
                        total_quantity: 0,
                        total_actual: 10,
                        total_adjustment: 10,
                        total_price: 75000
                    }
                ]
            }

        ];
        newRecord = {
            id: '1003',
            note: 'Kiem kho lan 3',
            store: {
                id: 'DT1',
                name: 'Duy Nguyen 2',
                phone: '0987667892',
                address: 'Sô 2,Hoang Quốc Việt,HN'
            },
            total_quantity: 0,
            total_actual: 20,
            total_adjustment: 20,
            items: [
                {
                    id: 'SP002',
                    total_quantity: 0,
                    total_actual: 10,
                    total_adjustment: 10,
                    total_price: 75000
                },
                {
                    id: 'SP003',
                    total_quantity: 0,
                    total_actual: 10,
                    total_adjustment: 10,
                    total_price: 75000
                }
            ]
        };
        Promise.all([
            Inventory.destroy({
                where: { id: { [Op.ne]: null } }
            }),
            Stock.destroy({
                where: { id: { [Op.ne]: null } }
            }),
            StockDetail.destroy({
                where: { id: { [Op.ne]: null } }
            })
        ]);
        await Stock.bulkCreate(records);
        const operations = [];
        records[0].items.forEach(item => {
            const product = item;
            product.item_id = item.id.toLowerCase();
            product.stock_id = records[0].id;
            product.created_by = records[0].created_by;
            product.created_at = new Date();
            product.updated_at = new Date();

            delete product.id;
            operations.push(item);
        });
        records[1].items.forEach(item => {
            const product = item;
            product.item_id = item.id.toLowerCase();
            product.stock_id = records[1].id;
            product.created_by = records[1].created_by;
            product.created_at = new Date();
            product.updated_at = new Date();

            delete product.id;
            operations.push(item);
        });
        records[2].items.forEach(item => {
            const product = item;
            product.item_id = item.id.toLowerCase();
            product.stock_id = records[2].id;
            product.created_by = records[2].created_by;
            product.created_at = new Date();
            product.updated_at = new Date();

            delete product.id;
            operations.push(item);
        });
        await StockDetail.bulkCreate(operations);
    });

    describe('GET /v1/stock-takes/:id', () => {
        it('should get stock by id', async () => {
            return request(app)
                .get('/v1/stock-takes/1000')
                .set('Authorization', token)
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when id not found', () => {
            return request(app)
                .get('/v1/stock-takes/asdasdasd')
                .set('Authorization', token)
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body.code).to.equal(404);
                    expect(res.body.message).to.equal('Không tìm thấy dữ liệu.!');
                    console.log('ok');
                });
        });
    });


    describe('GET /v1/stock-takes', () => {
        it('should get all stocks', () => {
            return request(app)
                .get('/v1/stock-takes')
                .set('Authorization', token)
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.count).to.be.an('number');
                    expect(res.body.count).to.be.have.eq(3);

                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data).to.have.lengthOf(3);
                    console.log('ok');
                });
        });
        it('should get all stocks with skip and limit', () => {
            return request(app)
                .get('/v1/stock-takes')
                .set('Authorization', token)
                .query({ skip: 2, limit: 20 })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.count).to.be.an('number');
                    expect(res.body.count).to.be.have.eq(3);

                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data).to.have.lengthOf(1);
                    console.log('ok');
                });
        });
        it('should report error when skip is not a number', () => {
            return request(app)
                .get('/v1/stock-takes')
                .set('Authorization', token)
                .query({ skip: 'asdasd', limit: 20 })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('skip');
                    expect(location).to.be.equal('query');
                    expect(messages).to.include('"skip" must be a number');
                    console.log('ok');
                });
        });
        it('should report error when limit is not a number', () => {
            return request(app)
                .get('/v1/stock-takes')
                .set('Authorization', token)
                .query({ skip: 0, limit: 'dasdasdads' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('limit');
                    expect(location).to.be.equal('query');
                    expect(messages).to.include('"limit" must be a number');
                    console.log('ok');
                });
        });
        it('should get all stocks with parmas keyword: 1001', () => {
            return request(app)
                .get('/v1/stock-takes')
                .set('Authorization', token)
                .query({ keyword: '1001' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.count).to.be.an('number');
                    expect(res.body.count).to.be.have.eq(1);

                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data).to.have.lengthOf(1);
                    console.log('ok');
                });
        });
        it('should get all stocks with params statuses = checking', () => {
            return request(app)
                .get('/v1/stock-takes')
                .set('Authorization', token)
                .query({ statuses: 'checking' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data).to.have.lengthOf(3);
                    console.log('ok');
                });
        });
        it('should get all stocks with params statuses = checking and confirmed', () => {
            return request(app)
                .get('/v1/stock-takes')
                .set('Authorization', token)
                .query({ statuses: 'checking,confirmed' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data).to.have.lengthOf(3);
                    console.log('ok');
                });
        });
        it('should get all stocks with params start_time = 2020/06/16, end_time = 2020/06/16 and by_date = create', () => {
            return request(app)
                .get('/v1/stock-takes')
                .set('Authorization', token)
                .query({ start_time: '2020/06/16', end_time: '2020/06/16', by_date: 'create' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data).to.have.lengthOf(3);
                    console.log('ok');
                });
        });
        it('should get all stocks with params not exists start_time = 1970/05/18, end_time = 1970/05/18 and by_date = create', () => {
            return request(app)
                .get('/v1/stock-takes')
                .set('Authorization', token)
                .query({ start_time: '1970/05/18', end_time: '1970/05/18', by_date: 'create' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data).to.have.lengthOf(0);
                    console.log('ok');
                });
        });
        it('should get all stocks with params start_time = 2020/06/16, end_time = 2020/06/16 and by_date = update', () => {
            return request(app)
                .get('/v1/stock-takes')
                .set('Authorization', token)
                .query({ start_time: '2020/06/16', end_time: '2020/06/16', by_date: 'update' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data).to.have.lengthOf(3);
                    console.log('ok');
                });
        });
        it('should get all stocks with params not exists start_time = 1970/05/18, end_time = 1970/05/18 and by_date = update', () => {
            return request(app)
                .get('/v1/stock-takes')
                .set('Authorization', token)
                .query({ start_time: '1970/05/18', end_time: '1970/05/18', by_date: 'update' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data).to.have.lengthOf(0);
                    console.log('ok');
                });
        });
        it('should return error when params start_time not type date', () => {
            return request(app)
                .get('/v1/stock-takes')
                .set('Authorization', token)
                .query({ start_time: 'asdasdasd', end_time: '2020/06/16' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('start_time');
                    expect(location).to.be.equal('query');
                    expect(messages).to.include(
                        '"start_time" must be a number of milliseconds or valid date string'
                    );
                    console.log('ok');
                });
        });
        it('should return error when params end_time not type date', () => {
            return request(app)
                .get('/v1/stock-takes')
                .set('Authorization', token)
                .query({ start_time: '2020/06/16', end_time: 'asasasasas' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('end_time');
                    expect(location).to.be.equal('query');
                    expect(messages).to.include(
                        '"end_time" must be a number of milliseconds or valid date string'
                    );
                    console.log('ok');
                });
        });
    });


    describe('POST /v1/stock-takes', () => {
        it('should create a new stock when request is ok', () => {
            return request(app)
                .post('/v1/stock-takes')
                .set('Authorization', token)
                .send(newRecord)
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when id already exists', () => {
            return request(app)
                .post('/v1/stock-takes')
                .set('Authorization', token)
                .send(Object.assign({}, newRecord, { id: '1001' }))
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(500);
                    expect(res.body.errors[0].message).to.equal('id must be unique');
                    console.log('ok');
                });
        });
        it('should report error when required fields is not provided', () => {
            const requiredFields = ['note', 'store', 'items'];
            newRecord = omit(newRecord, requiredFields);
            return request(app)
                .post('/v1/stock-takes')
                .set('Authorization', token)
                .send(newRecord)
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    for (
                        let index = 0;
                        index < requiredFields.length;
                        index += 1
                    ) {
                        const field = requiredFields[index];
                        expect(res.body.errors[index].field).to.be.equal(
                            `${field}`
                        );
                        expect(res.body.errors[index].location).to.be.equal(
                            'body'
                        );
                        expect(res.body.errors[index].messages).to.include(
                            `"${field}" is required`
                        );
                    }
                });
        });
        it('should create a new stock and set default values', () => {
            const defaultValues = ['reason', 'status', 'total_adjustment', 'total_actual', 'total_quantity'];
            newRecord = omit(
                newRecord, defaultValues
            );
            return request(app)
                .post('/v1/stock-takes')
                .set('Authorization', token)
                .send(newRecord)
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const {
                        created_by,
                        created_at,
                        updated_at
                    } = res.body.data;
                    expect(res.body.code).to.equal(0);
                    expect(created_by).to.be.an('object');
                    expect(created_at).to.be.an('number');
                    expect(updated_at).to.be.an('number');
                });
        });
    });


    describe('POST /v1/stock-takes/cancel/:id', () => {
        it('should report error when cancel a stock with incorrect id', () => {
            return request(app)
                .post('/v1/stock-takes/cancel/sdsada')
                .set('Authorization', token)
                .send({ reason: 'asass', status: 'cancelled' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(404);
                    expect(res.body.message).to.equal('Không tìm thấy dữ liệu.!');
                    console.log('ok');
                });
        });
        it('should cancel correct stock', () => {
            return request(app)
                .post('/v1/stock-takes/cancel/1002')
                .set('Authorization', token)
                .send({ reason: 'Huy kiem kho', status: 'cancelled' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when incorrect reason stock', () => {
            return request(app)
                .post('/v1/stock-takes/cancel/1002')
                .set('Authorization', token)
                .send({ reason: {} })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('reason');
                    expect(location).to.be.equal('body');
                    expect(messages).to.include('"reason" must be a string');
                    console.log('ok');
                });
        });
        it('should report error when required reasons is not provided', () => {
            return request(app)
                .post('/v1/stock-takes/cancel/1002')
                .set('Authorization', token)
                .send({ status: 'cancelled' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('reason');
                    expect(location).to.be.equal('body');
                    expect(messages).to.include('"reason" is required');
                    console.log('ok');
                });
        });
        it('should report error when incorrect status stock', () => {
            return request(app)
                .post('/v1/stock-takes/cancel/1002')
                .set('Authorization', token)
                .send({ reason: 'asass', status: 'asasasas' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('status');
                    expect(location).to.be.equal('body');
                    expect(messages).to.include('"status" must be one of [cancelled]');
                    console.log('ok');
                });
        });
    });


    describe('POST /v1/stock-takes/confirm/:id', () => {
        it('should report error when confirm a stock with incorrect id', () => {
            return request(app)
                .post('/v1/stock-takes/confirm/sdsada')
                .set('Authorization', token)
                .send({ reason: 'asass', status: 'confirmed' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(404);
                    expect(res.body.message).to.equal('Không tìm thấy dữ liệu.!');
                    console.log('ok');
                });
        });
        it('should confirm correct stock', () => {
            return request(app)
                .post('/v1/stock-takes/confirm/1002')
                .set('Authorization', token)
                .send({ reason: 'confirmed', status: 'confirmed' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when incorrect reason stock', () => {
            return request(app)
                .post('/v1/stock-takes/confirm/1002')
                .set('Authorization', token)
                .send({ reason: {}, status: 'confirmed' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('reason');
                    expect(location).to.be.equal('body');
                    expect(messages).to.include('"reason" must be a string');
                    console.log('ok');
                });
        });
        it('should report error when incorrect status stock', () => {
            return request(app)
                .post('/v1/stock-takes/confirm/1002')
                .set('Authorization', token)
                .send({ reason: 'asass', status: 'asasasas' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('status');
                    expect(location).to.be.equal('body');
                    expect(messages).to.include('"status" must be one of [confirmed]');
                    console.log('ok');
                });
        });
    });
});
