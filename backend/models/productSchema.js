const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  description: {
    type: String,
    default: "",
  },

  price: {
    type: Number,
    required: true,
    min: 0,
  },

  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100, 
  },

  quantity: {
    type: Number,
    default: 0,
    min: 0,
  },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },

  images: [{
    type: String,
  }],

  status: {
    type: String,
    enum: ['active', 'out_of_stock', 'inactive'],
    default: 'active',
  },

}, {
  timestamps: true
});

productSchema.virtual('finalPrice').get(function() {
  return this.price - (this.price * this.discount / 100);
});

module.exports = mongoose.model("Product", productSchema);
