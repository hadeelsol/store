const UserServices = require("../services/userServices");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const validator = require('validator'); // ADD THIS

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'default_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  
  // Remove password from output
  user.password = undefined;
  
  res.status(statusCode).json({
    status: "success",
    token,
    data: { user }
  });
}
async function getAllUsers(req, res) {
  try {
    const users = await UserServices.getAllUsers();
    res.status(200).json({
      status: "success",
      results: users.length,
      data: { users }
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
}

async function getUserById(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: "error",
        message: 'Invalid user ID format'
      });
    }
    
    const user = await UserServices.getUserById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found"
      });
    }
    
    res.status(200).json({
      status: "success",
      data: { user }
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
}

async function createUser(req, res) {
  try {
    const userData = req.body;
    const user = await UserServices.createUser(userData);
    
    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "Failed to create user"
      });
    }
    
    res.status(201).json({
      status: "success",
      message: "User created successfully",
      data: { user }
    });
  } catch (error) {
    console.error("Create user error:", error);
    
    if (error.code === 11000) { // MongoDB duplicate key error
      return res.status(400).json({
        status: "error",
        message: "Email already exists"
      });
    }
    
    res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
}

async function updateUser(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: "error",
        message: 'Invalid user ID format'
      });
    }
    
    const updatedUser = await UserServices.updateUser(req.params.id, req.body);
    
    if (!updatedUser) {
      return res.status(404).json({
        status: "error",
        message: "User not found"
      });
    }
    
    res.status(200).json({
      status: "success",
      message: "User updated successfully",
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
}

async function deleteUser(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: "error",
        message: 'Invalid user ID format'
      });
    }
    
    const deletedUser = await UserServices.deleteUser(req.params.id);
    
    if (!deletedUser) {
      return res.status(404).json({
        status: "error",
        message: "User not found"
      });
    }
    
    res.status(200).json({
      status: "success",
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
}
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }
    
    // Validate new password strength (optional)
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }
    
    // Get user ID from middleware
    const userId = req.user._id;
    
    // Call service
    const result = await userService.changePassword(userId, currentPassword, newPassword);
    
    res.status(200).json({
      success: true,
      message: result.message
    });
    
  } catch (error) {
    if (error.message === 'Current password is incorrect') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
async function registerUser(req, res) {
  try {
    console.log("Register request received:", req.body);
    
    const userData = req.body;
    
    // Validate required fields
    if (!userData.email || !userData.password || !userData.name) {
      return res.status(400).json({
        status: "error",
        message: "Please provide name, email, and password"
      });
    }
    
    // Email validation - CHECK IF validator IS IMPORTED
    if (!validator.isEmail(userData.email)) {
      return res.status(400).json({
        status: "error",
        message: "Please provide a valid email"
      });
    }
    
    // Password validation
    if (userData.password.length < 6) {
      return res.status(400).json({
        status: "error",
        message: "Password must be at least 6 characters"
      });
    }
    
    const user = await UserServices.registerUser(userData);
    
    if (user && user.error) {
      return res.status(400).json({
        status: "error",
        message: user.error
      });
    }
    
    if (!user) {
      return res.status(500).json({
        status: "error",
        message: "Failed to register user"
      });
    }
    
    // Create token directly for debugging
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'fallback_secret_123',
      { expiresIn: '7d' }
    );
    
    return res.status(201).json({
      status: "success",
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
    
  } catch (error) {
    console.error("Register user error:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        status: "error",
        message: "Email already exists"
      });
    }
    
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    // Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Please provide email and password",
      });
    }
    // Validate login through service
    const user = await UserServices.login(email, password);

    if (user.error) {
      return res.status(401).json({
        status: "error",
        message: user.error,
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "fallback_secret_123",
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      status: "success",
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
}


async function getCurrentUser(req, res) {
  try {
    res.status(200).json({
      status: "success",
      data: { user: req.user }
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
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
  login,
  getCurrentUser
};
