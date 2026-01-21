const Category = require("../services/categoryServices");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const validator = require('validator'); // ADD THIS

async function getAllCategories(req, res) {
  try {
    let categories = await Category.getAllCategories();
    res.status(200).json({
      status: "success",
      results: categories.length,
      data: {
        categories
      }
    });
  } catch (error) {
    console.error("Get all categories error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
}

async function getActiveCategories(req, res) {
  try {
    let categories = await Category.getActiveCategories();
    res.status(200).json({
      status: "success",
      results: categories.length,
      data: {
        categories
      }
    });
  } catch (error) {
    console.error("Get all active categories error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
}

async function createCategories(req, res) {
  try {
    const categoryData = req.body;
    const category = await Category.createCategories(categoryData);
    if (!category) {
      return res.status(400).json({
        status: "error",
        message: "Failed to create category"
      });
    }

    res.status(201).json({
      status: "success",
      message: "Category created successfully",
      data: {
        category
      }
    });
  } catch (error) {
    console.error("Create Category error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
}

async function updateCategory(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: "error",
        message: 'Invalid category ID format'
      });
    }
    const updatedCategory = await Category.updateCategories(req.params.id, req.body);
    if (!updatedCategory) {
      return res.status(404).json({
        status: "error",
        message: "Category not found"
      });
    }
    res.status(200).json({
      status: "success",
      message: "Category updated successfully",
      data: {
        category: updatedCategory
      }
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
}

async function deleteCategories(req,res){
  try{
    let deleteCategory=await Category.deleteCategories(req.params.id);
    if (!deleteCategory) {
      return res.status(404).json({
        status: "error",
        message: "Category not found"
      });
    }
    res.status(200).json({
      status: "success",
      message: "Category deleted successfully"
    });
  }catch(error){
    console.error("Delete Category error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
}

module.exports = {
  getAllCategories,
  getActiveCategories,
  createCategories,
  updateCategory,
  deleteCategories
};
