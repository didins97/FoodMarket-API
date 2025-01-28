const app = require('../app');
const request = require('supertest');
const db = require('../models');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'secret-key';

const generateToken = (user) => jwt.sign({ exp: Math.floor(Date.now() / 1000) + 60 * 60, id: user.id, role: user.role }, SECRET_KEY);

const createDummyUser = async (name, email, password, role) => db.User.create({ name, email, password, role });

describe('Order API', () => {
  let tokenAdmin, tokenUser, userId, adminId, orderId1, orderId2;

  beforeAll(async () => {
    await db.sequelize.sync({ force: true });

    const admin = await createDummyUser('admin', 'admin@example.com', 'password', 'admin');
    const user = await createDummyUser('user', 'user@example.com', 'password', 'user');

    tokenAdmin = generateToken(admin);
    tokenUser = generateToken(user);

    userId = user.id;
    adminId = admin.id;

    const category = await db.Categories.create({ name: 'Makanan' });
    await db.Food.bulkCreate([
      { name: 'Nasi Goreng', price: 20000, image: 'nasi-goreng.jpg', stock: 10, category_id: category.id },
      { name: 'Mie Goreng', price: 15000, image: 'mie-goreng.jpg', stock: 10, category_id: category.id },
    ]);

    const orders = [
      {
        address: 'Jl. Melati',
        payment_method: 'transfer',
        total_price: 35000,
        user_id: adminId,
        order_items: [
          { food_id: 1, price: 20000, qty: 2, subtotal: 40000 },
          { food_id: 2, price: 15000, qty: 1, subtotal: 15000 },
        ],
      },
      {
        address: 'Jl. Test',
        payment_method: 'cash',
        total_price: 35000,
        user_id: userId,
        order_items: [
          { food_id: 1, price: 20000, qty: 2, subtotal: 40000 },
          { food_id: 2, price: 15000, qty: 1, subtotal: 15000 },
        ],
      },
    ];

    [orderId1, orderId2] = await Promise.all(
      orders.map(order => db.Order.create(order, { include: ['order_items'] }).then(o => o.id))
    );
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  describe('POST /orders', () => {
    it('should return 401 if user is not logged in', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({ address: 'Jl. Test', payment_method: 'cash', order_data: [] });
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Auth failed');
    });

    it('should create new order and reduce stock', async () => {
      const [food1, food2] = await db.Food.findAll({ order: [['id', 'ASC']] });
      const initialStocks = [food1.stock, food2.stock];

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({
          address: 'Jl. Perintis',
          payment_method: 'cash',
          order_data: [
            { food_id: food1.id, qty: 2, price: food1.price },
            { food_id: food2.id, qty: 1, price: food2.price },
          ],
        });

      const [updatedFood1, updatedFood2] = await db.Food.findAll({ order: [['id', 'ASC']] });
      expect(updatedFood1.stock).toBe(initialStocks[0] - 2);
      expect(updatedFood2.stock).toBe(initialStocks[1] - 1);
      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('total_price');
    });

    it('should return 400 if order data is empty', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({ address: 'Jl. Test', payment_method: 'cash', order_data: [] });
      expect(response.status).toBe(400);
    });
  });

  describe('GET /orders', () => {
    it('should get all orders for admin', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${tokenAdmin}`);
      expect(response.status).toBe(200);
    });

    it('should return 401 if not logged in', async () => {
      const response = await request(app).get('/api/orders');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /orders/:id', () => {
    it('should return 404 if user accesses another user order', async () => {
      const response = await request(app)
        .get(`/api/orders/${orderId1}`)
        .set('Authorization', `Bearer ${tokenUser}`);
      expect(response.status).toBe(404);
    });

    it('should allow user to access own order', async () => {
      const response = await request(app)
        .get(`/api/orders/${orderId2}`)
        .set('Authorization', `Bearer ${tokenUser}`);
      expect(response.status).toBe(200);
    });
  });

  describe('PUT /orders/:id', () => {
    it('should update order status for admin', async () => {
      const response = await request(app)
        .put(`/api/orders/${orderId1}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ status: 'processed' });
      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('processed');
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .put(`/api/orders/${orderId1}`)
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({ status: 'processed' });
      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /orders/:id', () => {
    it('should delete order for admin', async () => {
      const response = await request(app)
        .delete(`/api/orders/${orderId1}`)
        .set('Authorization', `Bearer ${tokenAdmin}`);
      expect(response.status).toBe(200);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .delete(`/api/orders/${orderId1}`)
        .set('Authorization', `Bearer ${tokenUser}`);
      expect(response.status).toBe(403);
    });
  });
  
});
