import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../src/Components/Login';
import Register from '../src/Components/Register';
import Home from '../src/Components/Home';
import ProtectedRoute from '../src/Components/ProtectRoute';
import Categories from '../src/Components/Categories';
import Products from '../src/Components/product';
import ProductDetail from './Components/ProductDetail'; 
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
 <React.StrictMode>
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/category/:categoryId" element={<Products />} />
         <Route path="/product/:productId" element={<ProductDetail />} />
        {/* Default redirect - IMPORTANT: This should be LAST */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
