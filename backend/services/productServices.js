// services/productServices.js - KEEP ONLY THIS
const Product = require("../models/productSchema");

async function getAllProducts({
  page = 1,
  limit = 10,
  categoryId = null,
  search = ""
}) {
  try {
    const skip = (page - 1) * limit;
    const filter = {};

    if (categoryId) filter.category = categoryId;
    if (search) {
      filter.$or = [{
          name: {
            $regex: search,
            $options: "i"
          }
        },
        {
          description: {
            $regex: search,
            $options: "i"
          }
        }
      ];
    }
    const products = await Product.find(filter)
      .skip(skip)
      .limit(limit)
      .populate("category")
      .sort({
        createdAt: -1
      });

    const total = await Product.countDocuments(filter);

    return {
      products,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

async function getProductById(productId) {
  try {
    const product = await Product.findById(productId).populate("category");
    if (!product) throw new Error("Product not found");
    return product;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

// ✅ UNCOMMENT this function
async function createProduct(productData) {
  try {
    const { name, price, category } = productData;

    if (!name) throw new Error("Product name is required");
    if (price === undefined || price === null) throw new Error("Price is required");
    if (!category) throw new Error("Category is required");

    const newProduct = new Product(productData);
    const savedProduct = await newProduct.save();

    return savedProduct;
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
}

async function updateProduct(productId, updateData) {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updateData, {
        new: true,
        runValidators: true
      }
    ).populate("category");

    if (!updatedProduct) throw new Error("Product not found");
    return updatedProduct;

  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
}

async function deleteProduct(productId) {
  try {
    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (!deletedProduct) throw new Error("Product not found");

    return {
      success: true,
      message: "Product deleted"
    };
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
}

async function getProductsByCategory(categoryId, {
  page = 1,
  limit = 10
} = {}) {
  try {
    const skip = (page - 1) * limit;

    const products = await Product.find({
        category: categoryId
      })
      .skip(skip)
      .limit(limit)
      .populate("category")
      .sort({
        createdAt: -1
      });

    const total = await Product.countDocuments({
      category: categoryId
    });

    return {
      products,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
}

async function searchProducts(search = "", {
  page = 1,
  limit = 10
} = {}) {
  try {
    const skip = (page - 1) * limit;
    const filter = {};

    if (search) {
      filter.$or = [{
          name: {$regex: search,$options: "i"}
        },
        {
          description: {$regex: search,$options: "i"}
        }
      ];
    }

    const products = await Product.find(filter)
      .skip(skip)
      .limit(limit)
      .populate("category")
      .sort({
        createdAt: -1
      });

    const total = await Product.countDocuments(filter);

    return {
      products,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
}

async function updateProductStatus(productId, status) {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      productId, {
        status
      }, {
        new: true,
        runValidators: true
      }
    ).populate("category");

    if (!updatedProduct) throw new Error("Product not found");
    return updatedProduct;

  } catch (error) {
    console.error("Error in updateProductStatus:", error.message);
    throw error;
  }
}


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
