const productService = require("../services/productServices");
const Product = require("../models/productSchema");

const getAllProducts = async (req, res) => { //public
  try {
    const {
      page,
      limit,
      category,
      q: search
    } = req.query;

    const result = await productService.getAllProducts({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      categoryId: category || null,
      search: search || ""
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

const getProductById = async (req, res) => { //public
  try {
    const product = await productService.getProductById(req.params.id);

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    if (error.message === "Product not found") {
      res.status(404).json({
        success: false,
        message: "Product not found"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message
      });
    }
  }
};

const createProduct = async (req, res) => {
  try {
    console.log("Creating product...");
    const savedProduct = await productService.createProduct(req.body);
    return res.status(201).json({
      success: true,
      message: "Product created",
      data: savedProduct
    });
    
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const updateProduct = async (req, res) => { //admin
  try {
    const updatedProduct = await productService.updateProduct(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct
    });
  } catch (error) {
    if (error.message === "Product not found") {
      res.status(404).json({
        success: false,
        message: "Product not found"
      });
    } else {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
};


const deleteProduct = async (req, res) => { //admin
  try {
    const result = await productService.deleteProduct(req.params.id);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    if (error.message === "Product not found") {
      res.status(404).json({
        success: false,
        message: "Product not found"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message
      });
    }
  }
};


const getProductsByCategory = async (req, res) => { //public
  try {
    const {
      page,
      limit
    } = req.query;

    const result = await productService.getProductsByCategory(
      req.params.categoryId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10
      }
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

const searchProducts = async (req, res) => { //public
  try {
    const {
      q: search,
      page,
      limit
    } = req.query;

    if (!search) {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }

    const result = await productService.searchProducts(search, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};
const updateProductStatus = async (req, res) => { //admin
  try {
    const {status}=req.body;
    const {id}=req.params;

    if (!status || !['active', 'out_of_stock', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid status is required: active, out_of_stock, or inactive"
      });
    }

    const updatedProduct = await productService.updateProductStatus(id, status);

    res.status(200).json({
      success: true,
      message: `Product status updated to ${status}`,
      data: updatedProduct
    });
  } catch (error) {
    if (error.message === "Product not found") {
      res.status(404).json({
        success: false,
        message: "Product not found"
      });
    } else {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
};
module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  searchProducts,
  updateProductStatus
};
