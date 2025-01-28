const app = require('../app');
const bcrypt = require('bcryptjs');
const request = require('supertest');
const db = require('../models');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'secret-key';

const generateToken = (user) => jwt.sign({ exp: Math.floor(Date.now() / 1000) + 60 * 60, id: user.id, role: user.role }, SECRET_KEY);

const createDummyUser = async (name, email, password, role) => db.User.create({ name, email, password, role });


describe('User Controller', () => {
    let tokenUser, tokenAdmin, userId

    beforeAll(async () => {
        await db.sequelize.sync({ force: true });

        // create dummy user
        const user = await createDummyUser('user', 'user@example.com', 'password', 'user');
        const admin = await createDummyUser('admin', 'admin@example.com', 'password', 'admin');

        // get user id
        userId = user.id

        // generate token
        tokenUser = generateToken(user);
        tokenAdmin = generateToken(admin);
    });

    afterAll(async () => {
        await db.sequelize.close();
    });

    describe('GET /api/users', () => {
        it('should return 401 if user not logged in', async () => {
            const response = await request(app).get('/api/users').set('Accept', 'application/json');
            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Auth failed');
        })

        it('should return 403 if user not admin', async () => {
            const response = await request(app).get('/api/users').set('Authorization', `Bearer ${tokenUser}`);
            expect(response.status).toBe(403);
            expect(response.body.message).toBe('Access denied');
        })

        it('should return all users for admin', async () => {
            const response = await request(app).get('/api/users').set('Authorization', `Bearer ${tokenAdmin}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('meta');
            expect(response.body).toHaveProperty('data');

            expect(Array.isArray(response.body.data)).toBe(true);

            expect(response.body.meta.status).toBe('success');
            expect(response.body.meta.message).toBe('Get all users successfully');
            expect(response.body.data.length).toBe(2);

            expect(response.body.data[0]).toHaveProperty('id');
            expect(response.body.data[0]).toHaveProperty('name');
            expect(response.body.data[0]).toHaveProperty('email');
            expect(response.body.data[0]).toHaveProperty('role');
            expect(response.body.data[0]).toHaveProperty('createdAt');
            expect(response.body.data[0]).toHaveProperty('updatedAt');
        })
    });

    describe('GET /api/users/:id', () => {
        it('should return 401 if user not logged in', async () => {
            const response = await request(app).get(`/api/users/${userId}`);
            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Auth failed');
        });

        it('should return 403 if user not admin', async () => {
            const response = await request(app).get(`/api/users/${userId}`).set('Authorization', `Bearer ${tokenUser}`);
            expect(response.status).toBe(403);
            expect(response.body.message).toBe('Access denied');
        });

        it('should return user not found for invalid ID', async () => {
            const response = await request(app).get(`/api/users/3`).set('Authorization', `Bearer ${tokenAdmin}`);
            expect(response.status).toBe(404);
            expect(response.body.meta.message).toBe('User not found')
        })

        it('should return user data for valid ID', async () => {
            const response = await request(app).get(`/api/users/${userId}`).set('Authorization', `Bearer ${tokenAdmin}`);
            expect(response.status).toBe(200);

            expect(response.body).toHaveProperty('meta');
            expect(response.body).toHaveProperty('data');

            expect(response.body.meta.status).toBe('success');
            expect(response.body.meta.message).toBe('Get user by id successfully');

            expect(response.body.data).toHaveProperty('id', userId);
            expect(response.body.data).toHaveProperty('name');
            expect(response.body.data).toHaveProperty('email');
            expect(response.body.data).toHaveProperty('role');
            expect(response.body.data).toHaveProperty('createdAt');
            expect(response.body.data).toHaveProperty('updatedAt');
        });
    });

    describe('POST /api/users', () => {
        const validatedUserData = {
            name: "Cristiano Ronaldo",
            email: "cristiano@example.com",
            password: "password",
            role: "user"
        }

        it('should return 401 if user not logged in', async () => {
            const response = await request(app).post('/api/users').set('Accept', 'application/json');
            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Auth failed');
        })

        it('should return 403 if user not admin', async () => {
            const response = await request(app).post('/api/users').set('Authorization', `Bearer ${tokenUser}`);
            expect(response.status).toBe(403);
            expect(response.body.message).toBe('Access denied');
        })

        it('should validate password length', async () => {
            const response = await request(app)
                .post('/api/users')
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .set('Accept', 'application/json')
                .send({ ...validatedUserData, password: "pass" });

            expect(response.status).toBe(400);
            expect(response.body.meta.message).toBe("Validation error");
            expect(response.body.error[0].msg).toBe('Password must be at least 6 characters long')
        });

        it('should validate required name', async () => {
            const response = await request(app)
                .post('/api/users')
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .set('Accept', 'application/json')
                .send({ ...validatedUserData, name: "" });

            expect(response.status).toBe(400);
            expect(response.body.meta.message).toBe("Validation error");
            expect(response.body.error[0].msg).toBe('Name is required')
        });

        it('should validate invalid email', async () => {
            const response = await request(app)
                .post('/api/users')
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .set('Accept', 'application/json')
                .send({ ...validatedUserData, email: "cristiano" });

            expect(response.status).toBe(400);
            expect(response.body.meta.message).toBe("Validation error");
            expect(response.body.error[0].msg).toBe('Email is invalid')
        });

        it('should validate invalid role', async () => {
            const response = await request(app)
                .post('/api/users')
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .set('Accept', 'application/json')
                .send({ ...validatedUserData, role: "operator" });

            expect(response.status).toBe(400);
            expect(response.body.meta.message).toBe("Validation error");
            expect(response.body.error[0].msg).toBe('Role must be admin or user')
        });

        it('should create user successfully', async () => {
            const response = await request(app)
                .post('/api/users')
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .set('Accept', 'application/json')
                .send(validatedUserData);

            expect(response.status).toBe(201);

            expect(response.body).toHaveProperty('meta');
            expect(response.body).toHaveProperty('data');

            expect(response.body.meta.status).toBe('success');
            expect(response.body.meta.message).toBe('User created successfully');

            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data).toHaveProperty('name');
            expect(response.body.data).toHaveProperty('email');
            expect(response.body.data).toHaveProperty('role');
            expect(response.body.data).toHaveProperty('createdAt');
            expect(response.body.data).toHaveProperty('updatedAt');
        })
    });

    describe('PUT /api/users/:id', () => {
        const updatedUserData = {
            name: "Liones Messi",
            email: "liones@example.com",
            password: "password",
            role: "user"
        }

        it('should return 401 if user not logged in', async () => {
            const response = await request(app).put(`/api/users/${userId}`).set('Accept', 'application/json');
            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Auth failed');
        })

        it('should return 403 if user not admin', async () => {
            const response = await request(app).put(`/api/users/${userId}`).set('Authorization', `Bearer ${tokenUser}`);
            expect(response.status).toBe(403);
            expect(response.body.message).toBe('Access denied');
        })

        it('should return 404 if user data not found', async () => {
            const response = await request(app).put(`/api/users/4`).set('Authorization', `Bearer ${tokenAdmin}`);
            expect(response.status).toBe(404);
            expect(response.body.meta.message).toBe('User not found')
        })

        it('should update user successfully', async () => {
            const response = await request(app)
                .put(`/api/users/${userId}`)
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .set('Accept', 'application/json')
                .send(updatedUserData);

            expect(response.status).toBe(200);

            expect(response.body).toHaveProperty('meta');
            expect(response.body).toHaveProperty('data');

            expect(response.body.meta.status).toBe('success');
            expect(response.body.meta.message).toBe('User updated successfully');

            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data).toHaveProperty('name');
            expect(response.body.data).toHaveProperty('email');
            expect(response.body.data).toHaveProperty('role');
            expect(response.body.data).toHaveProperty('createdAt');
            expect(response.body.data).toHaveProperty('updatedAt');
        })
    });

    describe('DELETE /api/users/:id', () => {

        it('should return 401 if user not logged in', async () => {
            const response = await request(app).delete(`/api/users/${userId}`).set('Accept', 'application/json');
            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Auth failed');
        })

        it('should return 403 if user not admin', async () => {
            const response = await request(app).delete(`/api/users/${userId}`).set('Authorization', `Bearer ${tokenUser}`);
            expect(response.status).toBe(403);
            expect(response.body.message).toBe('Access denied');
        })

        it('should return 404 if user data not found', async () => {
            const response = await request(app).delete(`/api/users/4`).set('Authorization', `Bearer ${tokenAdmin}`);
            expect(response.status).toBe(404);
            expect(response.body.meta.message).toBe('User not found')
        })

        // case 4 : delete user success
        it('should delete user success', async () => {
            const response = await request(app).delete(`/api/users/${userId}`).set('Authorization', `Bearer ${tokenAdmin}`);
            expect(response.status).toBe(200);
            expect(response.body.meta.message).toBe('User deleted successfully');
            expect(response.body.meta.status).toBe('success');
            expect(response.body.data).toBe(null);
        })
    })
});