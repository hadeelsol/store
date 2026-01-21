const Category = require('../models/categorySchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function getAllCategories() {
  try {
    let categories = await Category.find();
    return categories;
  } catch (error) {
    console.error("Get all category error:", error);
    throw error;
  }
}

async function getActiveCategories() {
  try {
    const categories = await Category.find({
      status: "active"
    }).sort({
      name: 1
    });
    return categories;
  } catch (error) {
    console.error("Get active categories error:", error);
    throw error;
  }
}

async function createCategories(newCategory) {
  try {
    const {
      name,
      description,
      status
    } = newCategory;
    if (!name) {
      throw new Error('Category name is required');
    }
    // Check if category already exists
    const existing = await Category.findOne({
      name: {
        $regex: `^${name.trim()}$`,
        $options: "i"
      }
    });

    if (existing) {
      throw new Error('Category already exists');
    }

    const category = await Category.create({
      name: name.trim(),
      description: description || '',
      status: status || 'active'
    });

    return category;

  } catch (error) {
    console.error("Create category error:", error);
    throw error;
  }
}

async function updateCategories(id, updatedData) {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      id, {
        $set: updatedData
      }, {
        new: true,
        runValidators: true
      } // options: return updated doc & validate
    )
    if (!updatedCategory) {
      throw new Error('Category not found');
    }
    return updatedCategory;
  } catch (error) {
    console.error('Update category service error:', error);
    throw error;
  }
}

async function deleteCategories(id) {
  try {
    const deletedCategory = await Category.findByIdAndDelete(id);
    return deletedCategory;
  } catch (error) {
    console.error('Delete user service error:', error);
    throw error;
  }
}

module.exports = {
  getAllCategories,
  getActiveCategories,
  createCategories,
  updateCategories,
  deleteCategories
};
