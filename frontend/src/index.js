// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../src/Components/Login';
import Register from '../src/Components/Register';
import Home from '../src/Components/Home';
import ProtectedRoute from '../src/Components/ProtectRoute';
import Categories from '../src/Components/Categories';
import Products from '../src/Components/product';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected route - only accessible when logged in */}
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
           
          </ProtectedRoute>
        } />
        
        {/* Redirect all other routes */}
        <Route path="*" element={<Navigate to="/login" replace />} />
         <Route path="/categories" element={<Categories />} />
         <Route path="/products/category/:categoryId" element={<Products />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
