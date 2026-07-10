const mongoose = require("mongoose");

const DEFAULT_PRODUCT_IMAGE = {
  url: "https://media.istockphoto.com/id/1778918997/photo/background-of-a-large-group-of-assorted-capsules-pills-and-blisters.jpg?s=612x612&w=0&k=20&c=G6aeWKN1kHyaTxiNdToVW8_xGY0hcenWYIjjG_xwF_Q=",
  public_id: "default_product_image"
};

const productSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true, trim: true },

    slug: { type: String, lowercase: true, unique: true, trim: true },

    description: { type: String, required: true },

    price: { type: Number, required: true, min: 0 },

    offerPrice: {
      type: Number,
      min: 0,
      validate: {
        validator: function (value) {
          return value <= this.price;
        },
        message: "Offer price cannot be greater than main price",
      },
    },

    images: [
      {
        url: { type: String },
        public_id: { type: String }
      }
    ],

    category: { type: String, required: true, trim: true },

    stock: { type: Number, default: 0, min: 0 },

    status: {
      type: String,
      enum: ["active", "inactive", "outofstock"],
      default: "active",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }
  },
  { timestamps: true }
);

// Auto-generate slug
productSchema.pre("save", function () {
  if (this.isModified("productName")) {
    this.slug = this.productName.toLowerCase().replace(/ /g, "-");
  }
  if (!this.images || this.images.length === 0) {
    this.images = [DEFAULT_PRODUCT_IMAGE];
  }
});

module.exports = mongoose.model("Product", productSchema);
