/* eslint-disable no-undef */
/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-expressions */
import { Op } from 'sequelize';
import request from 'supertest';
import httpStatus from 'http-status';
import { expect } from 'chai';
import { omit } from 'lodash';
import app from '../../../index';
import Import from '../../../common/models/import.model';
import ImportDetail from '../../../common/models/import-detail.model';
import Inventory from '../../../common/models/inventory.model';

const token = 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InNoYWR5bG92ZSIsInBob25lIjoiMDk4ODg4ODg4OCIsImVtYWlsIjoiZW1haWxAZ21haWwuY29tIiwibmFtZSI6Ik5ndXnhu4VuIFbEg24gVGjDoG5oIiwiYXZhdGFyIjoiL3N0b3JhZ2VzL2F2YXRhci9kZWZhdWx0LmpwZyIsImV4cCI6MTU5MjI3MTYzNywiaWF0IjoxNTkyMTg1MjM3LCJhdWQiOiJ3ZWIiLCJpc3MiOiJhdXRoLmR1eW5ndXllbnRhaWxvci5jb20vdXNlci93ZWIifQ.OhiKDlxpZCBLb-AlImn-ryADfLKnmyBYAQbRmR-XeIkrzDWie3pWtuLpSlpOPiM5eYByRoI5wio8aR3iMZWd0lR4jocPb6EOSaGPmYI_uCu0n-opFjwS1sj2D3os0dF4vhFRwKf2MfRQ7ZmQZfCWb9aE2qV8wYQnaxbu84Y84zmmAoJG1CcdDVS9Q1Q4d9UDC2Xxiw_XCe6opyAiT37B-z1RYbKv2R1-Me-puGKapZvRfxDvCwxpRiY5VU8VVHmNfiV9WJMa9hkTNf6WhBcD_zJlUvi3yromk220PdfdGE_s2MTMhbUbAlVppWebOXmUk2nF5p236x3LT6qMfSwOyQ';
describe('Import API', async () => {
    let records;
    let newRecord;

    beforeEach(async () => {
        records = [
            {
                id: '1000',
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
                        name: 'SP002',
                        properties: {
                            unit: 'chiếc',
                            gender: 'Male',
                            season: null
                        },
                        total_quantity: 30,
                        total_price: 10000000000
                    },
                    {
                        id: 'SP003',
                        name: 'SP003',
                        properties: {
                            unit: 'chiếc',
                            gender: 'Male',
                            season: null
                        },
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
                        name: 'SP002',
                        properties: {
                            unit: 'chiếc',
                            gender: 'Male',
                            season: null
                        },
                        total_quantity: 30,
                        total_price: 10000000000
                    },
                    {
                        id: 'SP001',
                        name: 'SP001',
                        properties: {
                            unit: 'chiếc',
                            gender: 'Male',
                            season: null
                        },
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
                        name: 'SP003',
                        properties: {
                            unit: 'chiếc',
                            gender: 'Male',
                            season: null
                        },
                        total_quantity: 30,
                        total_price: 10000000000
                    },
                    {
                        id: 'SP001',
                        name: 'SP001',
                        properties: {
                            unit: 'chiếc',
                            gender: 'Male',
                            season: null
                        },
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
                    name: 'SP002',
                    properties: {
                        unit: 'chiếc',
                        gender: 'Male',
                        season: null
                    },
                    total_quantity: 30,
                    total_price: 10000000000
                },
                {
                    id: 'SP003',
                    name: 'SP003',
                    properties: {
                        unit: 'chiếc',
                        gender: 'Male',
                        season: null
                    },
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
        };
        Promise.all([
            Inventory.destroy({
                where: { id: { [Op.ne]: null } }
            }),
            Import.destroy({
                where: { id: { [Op.ne]: null } }
            }),
            ImportDetail.destroy({
                where: { id: { [Op.ne]: null } }
            })
        ]);
        await Import.bulkCreate(records);
        const operations = [];
        records[0].items.forEach(item => {
            const product = item;
            product.item_id = item.id.toLowerCase();
            product.import_id = records[0].id;
            product.created_by = records[0].created_by;
            product.created_at = new Date();
            product.updated_at = new Date();

            delete product.id;
            operations.push(item);
        });
        records[1].items.forEach(item => {
            const product = item;
            product.item_id = item.id.toLowerCase();
            product.import_id = records[1].id;
            product.created_by = records[1].created_by;
            product.created_at = new Date();
            product.updated_at = new Date();

            delete product.id;
            operations.push(item);
        });
        records[2].items.forEach(item => {
            const product = item;
            product.item_id = item.id.toLowerCase();
            product.import_id = records[2].id;
            product.created_by = records[2].created_by;
            product.created_at = new Date();
            product.updated_at = new Date();

            delete product.id;
            operations.push(item);
        });
        await ImportDetail.bulkCreate(operations);
    });

    describe('GET /v1/imports/:id', () => {
        it('should get import by id', async () => {
            return request(app)
                .get('/v1/imports/1000')
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
                .get('/v1/imports/asdasdasd')
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


    describe('GET /v1/imports', () => {
        it('should get all imports', () => {
            return request(app)
                .get('/v1/imports')
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
        it('should get all imports with skip and limit', () => {
            return request(app)
                .get('/v1/imports')
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
                .get('/v1/imports')
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
                .get('/v1/imports')
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
        it('should get all imports with parmas keyword: 1000', () => {
            return request(app)
                .get('/v1/imports')
                .set('Authorization', token)
                .query({ keyword: '1000' })
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
        it('should get all imports with params statuses = checking', () => {
            return request(app)
                .get('/v1/imports')
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
        it('should get all imports with params statuses = checking and confirmed', () => {
            return request(app)
                .get('/v1/imports')
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
        it('should get all imports with params start_time = 2020/06/15 and end_time = 2020/06/15', () => {
            return request(app)
                .get('/v1/imports')
                .set('Authorization', token)
                .query({ start_time: '2020/06/15', end_time: '2020/06/15' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data).to.have.lengthOf(3);
                    console.log('ok');
                });
        });
        it('should get all imports with params not exists start_time = 1970/05/18 and end_time = 1970/05/18', () => {
            return request(app)
                .get('/v1/imports')
                .set('Authorization', token)
                .query({ start_time: '1970/05/18', end_time: '1970/05/18' })
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
                .get('/v1/imports')
                .set('Authorization', token)
                .query({ start_time: 'asdasdasd', end_time: '2020/06/15' })
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
                .get('/v1/imports')
                .set('Authorization', token)
                .query({ start_time: '2020/06/15', end_time: 'asasasasas' })
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


    describe('POST /v1/imports', () => {
        it('should create a new import when request is ok', () => {
            return request(app)
                .post('/v1/imports')
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
                .post('/v1/imports')
                .set('Authorization', token)
                .send(Object.assign({}, newRecord, { id: '1000' }))
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(500);
                    expect(res.body.errors[0].message).to.equal('id must be unique');
                    console.log('ok');
                });
        });
        it('should create a new import when id is null', () => {
            return request(app)
                .post('/v1/imports')
                .set('Authorization', token)
                .send(omit(newRecord, 'id'))
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    console.log('aaaaaaaaaaaa', res.body);
                    expect(res.body.code).to.equal(500);
                    expect(res.body.errors[0].message).to.equal('id must be unique');
                    console.log('ok');
                });
        });
        it('should report error when required fields is not provided', () => {
            const requiredFields = ['note', 'source', 'store'];
            newRecord = omit(newRecord, requiredFields);
            return request(app)
                .post('/v1/imports')
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
        it('should create a new import and set default values', () => {
            const defaultValues = ['reason', 'status', 'total_quantity', 'total_price'];
            newRecord = omit(
                newRecord, defaultValues
            );
            return request(app)
                .post('/v1/imports')
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


    describe('PUT /v1/imports/:id', () => {
        it('should report error when update a import with incorrect id', () => {
            return request(app)
                .put('/v1/imports/sdsada')
                .set('Authorization', token)
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(404);
                    expect(res.body.message).to.equal('Không tìm thấy dữ liệu.!');
                    console.log('ok');
                });
        });
        it('should update correct note import', () => {
            return request(app)
                .put('/v1/imports/1002')
                .set('Authorization', token)
                .send({ note: 'note 2 update' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when incorrect note import', () => {
            return request(app)
                .put('/v1/imports/1002')
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
        it('should update correct reason import', () => {
            return request(app)
                .put('/v1/imports/1002')
                .set('Authorization', token)
                .send({ reason: 'reason 2 update' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when incorrect reason import', () => {
            return request(app)
                .put('/v1/imports/1002')
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


    describe('POST /v1/imports/cancel/:id', () => {
        it('should report error when cancel a import with incorrect id', () => {
            return request(app)
                .post('/v1/imports/cancel/sdsada')
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
        it('should cancel correct import', () => {
            return request(app)
                .post('/v1/imports/cancel/1002')
                .set('Authorization', token)
                .send({ reason: 'Huy don', status: 'cancelled' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when incorrect reason import', () => {
            return request(app)
                .post('/v1/imports/cancel/1002')
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
                .post('/v1/imports/cancel/1002')
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
        it('should report error when incorrect status import', () => {
            return request(app)
                .post('/v1/imports/cancel/1002')
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


    describe('POST /v1/imports/confirm/:id', () => {
        it('should report error when confirm a import with incorrect id', () => {
            return request(app)
                .post('/v1/imports/confirm/sdsada')
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
        it('should confirm correct import', () => {
            return request(app)
                .post('/v1/imports/confirm/1002')
                .set('Authorization', token)
                .send({ reason: 'confirmed', status: 'confirmed' })
                .expect('Content-Type', /json/)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.code).to.equal(0);
                    console.log('ok');
                });
        });
        it('should report error when incorrect reason import', () => {
            return request(app)
                .post('/v1/imports/confirm/1002')
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
        it('should report error when incorrect status import', () => {
            return request(app)
                .post('/v1/imports/confirm/1002')
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
