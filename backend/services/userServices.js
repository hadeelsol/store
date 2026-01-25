const User = require('../models/userSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function getAllUsers() {
  try {
    const users = await User.find().select('-password -__v');
    return users;
  } catch (error) {
    console.error("Get all users service error:", error);
    throw error;
  }
}

async function getUserById(id) {
  try {
    const user = await User.findById(id).select('-password -__v');
    return user;
  } catch (error) {
    console.error('Get user by ID service error:', error);
    throw error;
  }
}

async function createUser(newUser) {
  try {
    // Validate required fields
    if (!newUser.email || !newUser.password || !newUser.name) {
      throw new Error('Missing required fields');
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: newUser.email });
    if (existingUser) {
      return null;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(newUser.password, 12);
    
    const user = new User({
      name: newUser.name,
      email: newUser.email,
      password: hashedPassword,
      role: newUser.role || "customer" // Default to customer
    });
    
    const savedUser = await user.save();
    
    // Remove password from return value
    savedUser.password = undefined;
    return savedUser;
  } catch (error) {
    console.error('Create user service error:', error);
    throw error;
  }
}

async function updateUser(id, updatedData) {
  try {
    // If updating password, hash it
    if (updatedData.password) {
      updatedData.password = await bcrypt.hash(updatedData.password, 12);
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { 
        new: true,
        runValidators: true 
      }
    ).select('-password -__v');
    
    return updatedUser;
  } catch (error) {
    console.error('Update user service error:', error);
    throw error;
  }
}

async function deleteUser(id) {
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    return deletedUser;
  } catch (error) {
    console.error('Delete user service error:', error);
    throw error;
  }
}

async function changePassword(userId, currentPassword, newPassword) {
  try {
    // Find user with password
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update password
    user.password = hashedPassword;
    await user.save();
    
    return { success: true, message: 'Password updated successfully' };
  } catch (error) {
    console.error('Change password service error:', error);
    throw error;
  }
}
async function registerUser(userData) {
  try {
    // Check if email exists
    const exists = await User.findOne({ email: userData.email });
    if (exists) {
      return { error: "Email already exists" };
    }
    
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
   
    const validRoles = ['customer','admin'];
    const role = validRoles.includes(userData.role) ? userData.role : 'customer';
    
    const user = new User({
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role
    });
    
    const savedUser = await user.save();
    
    // Remove password from return value
    savedUser.password = undefined;
    return savedUser;
  } catch (error) {
    console.error("Register user service error:", error);
    throw error;
  }
}

async function login(email, password) {
  try {
    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return { error: "Invalid email or password" };
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return { error: "Invalid email or password" };
    }
    
    // Remove password from return value
    user.password = undefined;
    return user;
  } catch (error) {
    console.error("Login service error:", error);
    throw error;
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  registerUser,
  login
};
