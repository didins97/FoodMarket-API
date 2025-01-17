const express = require('express');

const app = express();
app.use(express.json());

require('./routers/user')(app);
require('./routers/auth')(app);
require('./routers/food')(app);
require('./routers/cart')(app);
require('./routers/order')(app);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});