const express = require('express');
const app = express();

// ✅ ADD THIS LINE:
const path = require('path');  // <-- THIS IS MISSING!

const CategoryRoute = require('./routes/CategoryRoute');
const DB = require('./database');
const UserRoute = require('./routes/UserRoute'); 
const ProductRoute = require("./routes/ProductRoute");
const CartRoute = require("./routes/CartRouter");
const OrderRoute = require('./routes/OrderRoute');
const uploadRoutes = require('./routes/uploadRoute'); 

DB.connectDB();

// ✅ NOW THIS WILL WORK:
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

app.use('/api/users', UserRoute);
app.use('/api/categories', CategoryRoute);  
app.use('/api/products', ProductRoute);
app.use('/api/cart', CartRoute);
app.use('/api/orders', OrderRoute);
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
