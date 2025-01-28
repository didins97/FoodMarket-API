const app = require('../app');
const request = require('supertest');
const db = require('../models');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'secret-key';

const generateToken = (user) => {
    return  jwt.sign({ exp: Math.floor(Date.now() / 1000) + 60 * 60, id: user.id, role: user.role }, SECRET_KEY);
};

const createDummyCategory = async (name) => {
    const category = await db.Categories.create({
        name: name
    })
    return category
}

const createDummyFood = async (name, price, image, stock, category_id) => {
    const food = await db.Food.create({
        name: name,
        price: price,
        image: image,
        stock: stock,
        category_id: category_id
    })
    return food
}

const createDummyUser = async (name, email, password, role) => {
    const user = await db.User.create({
        name: name,
        email: email,
        password: password,
        role: role
    })
    return user
}

describe('Food Controller', () => {
    let tokenUser, tokenAdmin, foodId, userId, categoryId

    beforeAll(async () => {
        await db.sequelize.sync({ force: true });

        const user = await createDummyUser('user', 'user@example.com', 'user123', 'user');
        const admin = await createDummyUser('admin', 'admin@example.com', 'admin123', 'admin');
        const category = await createDummyCategory('Pecel lele');
        const food = await createDummyFood('Pecel lele', 10000, 'pecel-lele.jpg', 10, category.id);

        tokenUser = generateToken(user);
        tokenAdmin = generateToken(admin);

        foodId = food.id;
        userId = user.id;
        categoryId = category.id
    });

    afterAll(async () => {
        await db.sequelize.close();
    });

    describe('GET /api/foods', () => {
        it('should return 401 if not logged in', async () => {
            const response = await request(app).get('/api/foods').set('Accept', 'application/json');
            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Auth failed');
        })

        it('should return all foods successfully', async () => {
            const response = await request(app).get('/api/foods').set('Authorization', `Bearer ${tokenAdmin}`);

            expect(response.status).toBe(200);

            expect(response.body).toHaveProperty('meta');
            expect(response.body).toHaveProperty('data');

            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBe(1);

            expect(response.body.meta.status).toBe('success');
            expect(response.body.meta.message).toBe('Get all foods successfully');

            expect(response.body.data[0]).toHaveProperty('id');
            expect(response.body.data[0]).toHaveProperty('name');
            expect(response.body.data[0]).toHaveProperty('category_id');
            expect(response.body.data[0]).toHaveProperty('price');
            expect(response.body.data[0]).toHaveProperty('image');
            expect(response.body.data[0]).toHaveProperty('createdAt');
            expect(response.body.data[0]).toHaveProperty('updatedAt');
        })
    });

    describe('GET /api/foods/:id', () => {
        it('should return 401 if not logged in', async () => {
            const response = await request(app).get(`/api/foods/${foodId}`).set('Accept', 'application/json');
            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Auth failed');
        });

        it('should return 404 if food not found', async () => {
            const response = await request(app).get(`/api/foods/2`).set('Authorization', `Bearer ${tokenAdmin}`);
            expect(response.status).toBe(404);
            expect(response.body.meta.message).toBe('Food not found');
        });


        it('should return food by id successfully', async () => {
            const response = await request(app).get(`/api/foods/${foodId}`).set('Authorization', `Bearer ${tokenAdmin}`);

            expect(response.status).toBe(200);

            expect(response.body).toHaveProperty('meta');
            expect(response.body).toHaveProperty('data');

            expect(response.body.meta.status).toBe('success');
            expect(response.body.meta.message).toBe('Get food by id successfully');

            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data).toHaveProperty('name');
            expect(response.body.data).toHaveProperty('category_id');
            expect(response.body.data).toHaveProperty('price');
            expect(response.body.data).toHaveProperty('image');
            expect(response.body.data).toHaveProperty('createdAt');
            expect(response.body.data).toHaveProperty('updatedAt');
        });
    });

    describe('POST /api/foods', () => {
        const foodData = {
            name: "Nasi Goreng",
            price: 4000,
            image: "nasi-goreng.jpeg",
            stock: 10,
        }

        it('should return 401 if not logged in', async () => {
            const response = await request(app).post(`/api/foods`).set('Accept', 'application/json');
            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Auth failed');
        });

        it('should return 403 if user is not admin', async () => {
            const response = await request(app).post(`/api/foods`).set('Authorization', `Bearer ${tokenUser}`)
            expect(response.status).toBe(403);
            expect(response.body.message).toBe('Access denied');
        })

        it('shoud validate attribute required', async () => {
            const response = await request(app)
                .post('/api/foods')
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .set('Accept', 'application/json')
                .send({ name: "", price: "", image: "", stock: "", category_id: "" })

            expect(response.status).toBe(400)
            expect(response.body.error.length).toBe(5);
        });

        it('should create food successfully', async () => {
            const response = await request(app)
                .post('/api/foods')
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .set('Accept', 'application/json')
                .send({ ...foodData, category_id: categoryId });

            expect(response.status).toBe(201);

            expect(response.body).toHaveProperty('meta');
            expect(response.body).toHaveProperty('data');

            expect(response.body.meta.status).toBe('success');
            expect(response.body.meta.message).toBe('Food created successfully');

            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data).toHaveProperty('name');
            expect(response.body.data).toHaveProperty('category_id');
            expect(response.body.data).toHaveProperty('price');
            expect(response.body.data).toHaveProperty('image');
            expect(response.body.data).toHaveProperty('createdAt');
            expect(response.body.data).toHaveProperty('updatedAt');
        })
    });

    describe('PUT /api/foods/:id', () => {
        const updateFood = {
            name: "Nasi Kuning",
            price: 10000,
            image: "image.jpeg",
            stock: 11,
            category_id: categoryId
        }

        it('should return 401 if not logged in', async () => {
            const response = await request(app).put(`/api/foods/${foodId}`).set('Accept', 'application/json');
            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Auth failed');
        });

        it('should return 403 if not admin', async () => {
            const response = await request(app).put(`/api/foods/${foodId}`).set('Authorization', `Bearer ${tokenUser}`)
            expect(response.status).toBe(403);
            expect(response.body.message).toBe('Access denied');
        })

        it('should return 404 if food not found', async () => {
            const response = await request(app).put(`/api/foods/11`).set('Authorization', `Bearer ${tokenAdmin}`)
            expect(response.status).toBe(404);
            expect(response.body.meta.message).toBe('Food not found');
        })

        it('shoud validate attribute required', async () => {
            const response = await request(app)
                .put(`/api/foods/${foodId}`)
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .set('Accept', 'application/json')
                .send({ name: "", price: "", image: "", stock: "", category_id: "" })

            expect(response.status).toBe(400)
            expect(response.body.error.length).toBe(5);
        });

        it('should update food successfully', async () => {
            const response = await request(app)
                .put(`/api/foods/${foodId}`)
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .set('Accept', 'application/json')
                .send(updateFood);

            expect(response.status).toBe(200);

            expect(response.body).toHaveProperty('meta');
            expect(response.body).toHaveProperty('data');

            expect(response.body.meta.status).toBe('success');
            expect(response.body.meta.message).toBe('Food updated successfully');

            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data).toHaveProperty('name', updateFood.name);
            expect(response.body.data).toHaveProperty('price', updateFood.price);
            expect(response.body.data).toHaveProperty('image', updateFood.image);
        })
    });

    describe('DELETE /api/foods/:id', () => {
        it('should return 401 if not logged in', async () => {
            const response = await request(app).delete(`/api/foods/${foodId}`);
            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Auth failed');
        });

        it('should return 403 if not admin', async () => {
            const response = await request(app).delete(`/api/foods/${foodId}`).set('Authorization', `Bearer ${tokenUser}`);
            expect(response.status).toBe(403);
            expect(response.body.message).toBe('Access denied');
        })

        it('should return 404 if food not found', async () => {
            const response = await request(app).delete(`/api/foods/11`).set('Authorization', `Bearer ${tokenAdmin}`)
            expect(response.status).toBe(404);
            expect(response.body.meta.message).toBe('Food not found');
        })

        it('should delete food successfully', async () => {
            const response = await request(app).delete(`/api/foods/${foodId}`).set('Authorization', `Bearer ${tokenAdmin}`);
            expect(response.status).toBe(200);
            expect(response.body.meta.message).toBe('Food deleted successfully');
            expect(response.body.meta.status).toBe('success');
            expect(response.body.data).toBe(null);
        });

    });
});