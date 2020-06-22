/* eslint-disable no-undef */
/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-expressions */
import { Op } from 'sequelize';
import request from 'supertest';
import httpStatus from 'http-status';
import { expect } from 'chai';
import { omit } from 'lodash';
import app from '../../../index';
import Export from '../../../common/models/export.model';
import ExportDetail from '../../../common/models/export-detail.model';
import Inventory from '../../../common/models/inventory.model';

const token = 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InNoYWR5bG92ZSIsInBob25lIjoiMDk4ODg4ODg4OCIsImVtYWlsIjoiZW1haWxAZ21haWwuY29tIiwibmFtZSI6Ik5ndXnhu4VuIFbEg24gVGjDoG5oIiwiYXZhdGFyIjoiL3N0b3JhZ2VzL2F2YXRhci9kZWZhdWx0LmpwZyIsImV4cCI6MTU5MjM1NzMzNCwiaWF0IjoxNTkyMjcwOTM0LCJhdWQiOiJ3ZWIiLCJpc3MiOiJhdXRoLmR1eW5ndXllbnRhaWxvci5jb20vdXNlci93ZWIifQ.ezAoaLe9jvKKolsM_Sp-BIFAuKzxBjSJxlCaOiyLrZ6k7hHVWQfYi-5VeTuH8eco-ZoFBkJoTIEcqg9CFbJZ295nl6P_NVPy_Gk6_NBOaG0rus74yYOJ_atZDmgIi4qif4p9h1rXoEgdRvNL9JULG7_3lyxe6wi6DeHDqRTYpHSYZlZ0KDRndsNRGgRJIrbBFRQRVte129ZBBqUi-MJgGwsZ5Qndz_kzCdJnt-JHFBIVHh7xpfuN5ZIIBw2EjtZz2ktnu2lz7NMYTsp0SCuhym1oceNy9a66xpwZvDtxwL6xhDclHJZPp4qS9bPKhb75eNu8mflHuezsXWNHbqyoFQ';
describe('export API', async () => {
    let records;
    let newRecord;

    beforeEach(async () => {
        records = [
            {
                id: '1003',
                type: 1,
                note: 'Nhập sản phẩm về điểm 1',
                source: {
                    id: 'SO001',
                    name: 'Source 1',
                    phone: '0987654321',
                    address: 'Số 1, Hoàng Quốc Việt, HN'
                },
                store: {
                    id: 'ST002',
                    name: 'Store 2',
                    phone: '0987654322',
                    address: 'Số 2, Hoàng Quốc Việt, HN'
                },
                items: [
                    {
                        id: 'SP002',
                        total_quantity: 30,
                        total_price: 10000000000
                    },
                    {
                        id: 'SP003',
                        total_quantity: 30,
                        total_price: 10000000000
                    }
                ],
                total_quantity: 90,
                total_price: 30000000000,
                created_by: {
                    id: 'shadylove',
                    name: 'Thanh Nguyen'
                }
            },
            {
                id: '1001',
                type: 2,
                note: 'Nhập sản phẩm về điểm 2',
                source: {
                    id: 'SO001',
                    name: 'Source 1',
                    phone: '0987654321',
                    address: 'Số 1, Hoàng Quốc Việt, HN'
                },
                store: {
                    id: 'ST002',
                    name: 'Store 2',
                    phone: '0987654322',
                    address: 'Số 2, Hoàng Quốc Việt, HN'
                },
                items: [
                    {
                        id: 'SP002',
                        total_quantity: 30,
                        total_price: 10000000000
                    },
                    {
                        id: 'SP001',
                        total_quantity: 30,
                        total_price: 10000000000
                    }
                ],
                total_quantity: 90,
                total_price: 30000000000,
                created_by: {
                    id: 'shadylove',
                    name: 'Thanh Nguyen'
                }
            },
            {
                id: '1002',
                type: 3,
                note: 'Nhập sản phẩm về điểm 3',
                source: {
                    id: 'SO001',
                    name: 'Source 1',
                    phone: '0987654321',
                    address: 'Số 1, Hoàng Quốc Việt, HN'
                },
                store: {
                    id: 'ST002',
                    name: 'Store 2',
                    phone: '0987654322',
                    address: 'Số 2, Hoàng Quốc Việt, HN'
                },
                items: [
                    {
                        id: 'SP003',
                        total_quantity: 30,
                        total_price: 10000000000
                    },
                    {
                        id: 'SP001',
                        total_quantity: 30,
                        total_price: 10000000000
                    }
                ],
                total_quantity: 90,
                total_price: 30000000000,
                created_by: {
                    id: 'shadylove',
                    name: 'Thanh Nguyen'
                }
            },
        ];
        newRecord = {
            id: '1004',
            type: 3,
            note: 'Nhập sản phẩm về điểm 7',
            source: {
                id: 'SO001',
                name: 'Source 1',
                phone: '0987654321',
                address: 'Số 1, Hoàng Quốc Việt, HN'
            },
            store: {
                id: 'ST002',
                name: 'Store 2',
                phone: '0987654322',
                address: 'Số 2, Hoàng Quốc Việt, HN'
            },
            items: [
                {
                    id: 'SP002',
                    total_quantity: 30,
                    total_price: 10000000000
                },
                {
                    id: 'SP003',
                    total_quantity: 30,
                    total_price: 10000000000
                }
            ],
            total_quantity: 90,
            total_price: 30000000000,
            // created_by: {
            //     id: 'shadylove',
            //     name: 'Thanh Nguyen'
            // }
        };
        Promise.all([
            Inventory.destroy({
                where: { id: { [Op.ne]: null } }
            }),
            Export.destroy({
                where: { id: { [Op.ne]: null } }
            }),
            ExportDetail.destroy({
                where: { id: { [Op.ne]: null } }
            })
        ]);
        await Export.bulkCreate(records);
        const operations = [];
        records[0].items.forEach(item => {
            const product = item;
            product.item_id = item.id.toLowerCase();
            product.export_id = records[0].id;
            product.created_by = records[0].created_by;
            product.created_at = new Date();
            product.updated_at = new Date();

            delete product.id;
            operations.push(item);
        });
        records[1].items.forEach(item => {
            const product = item;
            product.item_id = item.id.toLowerCase();
            product.export_id = records[1].id;
            product.created_by = records[1].created_by;
            product.created_at = new Date();
            product.updated_at = new Date();

            delete product.id;
            operations.push(item);
        });
        records[2].items.forEach(item => {
            const product = item;
            product.item_id = item.id.toLowerCase();
            product.export_id = records[2].id;
            product.created_by = records[2].created_by;
            product.created_at = new Date();
            product.updated_at = new Date();

            delete product.id;
            operations.push(item);
        });
        await ExportDetail.bulkCreate(operations);
    });

    describe('GET /v1/exports/:id', () => {
        it('should get export by id', async () => {
            return request(app)
                .get('/v1/exports/1001')
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
                .get('/v1/exports/asdasdasd')
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


    describe('GET /v1/exports', () => {
        it('should get all exports', () => {
            return request(app)
                .get('/v1/exports')
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
        it('should get all exports with skip and limit', () => {
            return request(app)
                .get('/v1/exports')
                .set('Authorization', token)
                .query({ skip: 2, limit: 10 })
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
                .get('/v1/exports')
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
                .get('/v1/exports')
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
        it('should get all exports with parmas keyword: 1001', () => {
            return request(app)
                .get('/v1/exports')
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
        it('should get all exports with params types = 1', () => {
            return request(app)
                .get('/v1/exports')
                .set('Authorization', token)
                .query({ types: '1' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data).to.have.lengthOf(1);
                    console.log('ok');
                });
        });
        it('should get all exports with params types = 1, 2 and 3', () => {
            return request(app)
                .get('/v1/exports')
                .set('Authorization', token)
                .query({ types: '1,2,3' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data).to.have.lengthOf(3);
                    console.log('ok');
                });
        });
        it('should get all exports with params statuses = delivery', () => {
            return request(app)
                .get('/v1/exports')
                .set('Authorization', token)
                .query({ statuses: 'delivery' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data).to.have.lengthOf(3);
                    console.log('ok');
                });
        });
        it('should get all exports with params statuses = delivery and confirmed', () => {
            return request(app)
                .get('/v1/exports')
                .set('Authorization', token)
                .query({ statuses: 'delivery,confirmed' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data).to.have.lengthOf(3);
                    console.log('ok');
                });
        });
        it('should get all exports with params start_time = 2020/06/16, end_time = 2020/06/16 and by_date = delivery', () => {
            return request(app)
                .get('/v1/exports')
                .set('Authorization', token)
                .query({ start_time: '2020/06/16', end_time: '2020/06/16', by_date: 'delivery' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data).to.have.lengthOf(3);
                    console.log('ok');
                });
        });
        it('should get all exports with params not exists start_time = 1970/05/18, end_time = 1970/05/18 and by_date = delivery', () => {
            return request(app)
                .get('/v1/exports')
                .set('Authorization', token)
                .query({ start_time: '1970/05/18', end_time: '1970/05/18', by_date: 'delivery' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data).to.have.lengthOf(0);
                    console.log('ok');
                });
        });
        it('should get all exports with params start_time = 2020/06/16, end_time = 2020/06/16 and by_date = received', () => {
            return request(app)
                .get('/v1/exports')
                .set('Authorization', token)
                .query({ start_time: '2020/06/16', end_time: '2020/06/16', by_date: 'received' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data).to.have.lengthOf(0);
                    console.log('ok');
                });
        });
        it('should get all exports with params not exists start_time = 1970/05/18, end_time = 1970/05/18 and by_date = received', () => {
            return request(app)
                .get('/v1/exports')
                .set('Authorization', token)
                .query({ start_time: '1970/05/18', end_time: '1970/05/18', by_date: 'received' })
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
                .get('/v1/exports')
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
                .get('/v1/exports')
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


    describe('POST /v1/exports', () => {
        it('should create a new export when request is ok', () => {
            return request(app)
                .post('/v1/exports')
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
                .post('/v1/exports')
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
        it('should create a new export when id is null', () => {
            return request(app)
                .post('/v1/exports')
                .set('Authorization', token)
                .send(omit(newRecord, 'id'))
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    console.log('aaaaaaaaaaaaa', res.body);
                    // expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when required fields is not provided', () => {
            const requiredFields = ['note', 'items'];
            newRecord = omit(newRecord, requiredFields);
            return request(app)
                .post('/v1/exports')
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
        it('should create a new export and set default values', () => {
            const defaultValues = ['reason', 'status', 'source', 'store', 'received_at', 'total_quantity', 'total_price'];
            newRecord = omit(
                newRecord, defaultValues
            );
            return request(app)
                .post('/v1/exports')
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


    describe('PUT /v1/exports/:id', () => {
        it('should report error when update a export with incorrect id', () => {
            return request(app)
                .put('/v1/exports/sdsada')
                .set('Authorization', token)
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(404);
                    expect(res.body.message).to.equal('Không tìm thấy dữ liệu.!');
                    console.log('ok');
                });
        });
        it('should update correct note export', () => {
            return request(app)
                .put('/v1/exports/1002')
                .set('Authorization', token)
                .send({ note: 'note 2 update' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when incorrect note export', () => {
            return request(app)
                .put('/v1/exports/1002')
                .set('Authorization', token)
                .send({ note: {} })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('note');
                    expect(location).to.be.equal('body');
                    expect(messages).to.include('"note" must be a string');
                    console.log('ok');
                });
        });
        it('should update correct reason export', () => {
            return request(app)
                .put('/v1/exports/1002')
                .set('Authorization', token)
                .send({ reason: 'reason 2 update' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when incorrect reason export', () => {
            return request(app)
                .put('/v1/exports/1002')
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
    });


    describe('POST /v1/exports/cancel/:id', () => {
        it('should report error when cancel a export with incorrect id', () => {
            return request(app)
                .post('/v1/exports/cancel/sdsada')
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
        it('should cancel correct export', () => {
            return request(app)
                .post('/v1/exports/cancel/1002')
                .set('Authorization', token)
                .send({ reason: 'Huy don', status: 'cancelled' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when incorrect reason export', () => {
            return request(app)
                .post('/v1/exports/cancel/1002')
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
                .post('/v1/exports/cancel/1002')
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
        it('should report error when incorrect status export', () => {
            return request(app)
                .post('/v1/exports/cancel/1002')
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


    describe('POST /v1/exports/return/:id', () => {
        it('should report error when return a export with incorrect id', () => {
            return request(app)
                .post('/v1/exports/return/sdsada')
                .set('Authorization', token)
                .send({ reason: 'asass', status: 'returning' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(404);
                    expect(res.body.message).to.equal('Không tìm thấy dữ liệu.!');
                    console.log('ok');
                });
        });
        it('should return correct export', () => {
            return request(app)
                .post('/v1/exports/return/1002')
                .set('Authorization', token)
                .send({ reason: 'Tra hang loi', status: 'returning' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when incorrect reason export', () => {
            return request(app)
                .post('/v1/exports/return/1002')
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
        it('should report error when incorrect status export', () => {
            return request(app)
                .post('/v1/exports/return/1002')
                .set('Authorization', token)
                .send({ reason: 'asass', status: 'asasasas' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('status');
                    expect(location).to.be.equal('body');
                    expect(messages).to.include('"status" must be one of [returning]');
                    console.log('ok');
                });
        });
    });


    describe('POST /v1/exports/confirm/:id', () => {
        it('should report error when confirm a export with incorrect id', () => {
            return request(app)
                .post('/v1/exports/confirm/sdsada')
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
        it('should confirm correct export', () => {
            return request(app)
                .post('/v1/exports/confirm/1002')
                .set('Authorization', token)
                .send({ reason: 'confirmed', status: 'confirmed' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when incorrect reason export', () => {
            return request(app)
                .post('/v1/exports/confirm/1002')
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
        it('should report error when incorrect status export', () => {
            return request(app)
                .post('/v1/exports/confirm/1002')
                .set('Authorization', token)
                .send({ reason: 'asass', status: 'asasasas' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    const { field, location, messages } = res.body.errors[0];
                    expect(res.body.code).to.be.equal(400);
                    expect(field).to.be.equal('status');
                    expect(location).to.be.equal('body');
                    expect(messages).to.include('"status" must be one of [returned, confirmed]');
                    console.log('ok');
                });
        });
    });
});
