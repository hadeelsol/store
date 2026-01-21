const express = require('express');
const app = express();
const CategoryRoute = require('./routes/CategoryRoute');
const DB = require('./database');
const UserRoute = require('./routes/UserRoute'); 
const ProductRoute=require("./routes/ProductRoute");
const CartRoute=require("./routes/CartRouter");
const OrderRoute = require('./routes/OrderRoute');
DB.connectDB();
app.use(express.json());


app.use('/api/users', UserRoute);
app.use('/api/categories', CategoryRoute);  
app.use('/api/products',ProductRoute);
app.use('/api/carts',CartRoute);
app.use('/api/orders', OrderRoute);

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
