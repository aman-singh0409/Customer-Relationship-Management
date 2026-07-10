const Product = require("../models/Product");
const {
  createProductValidation,
  updateProductValidation,
} = require("../validations/product.validation");
const cloudinary = require("../config/cloudinary");

// Default Image Config
const DEFAULT_IMAGE = {
  url: "https://media.istockphoto.com/id/1778918997/photo/background-of-a-large-group-of-assorted-capsules-pills-and-blisters.jpg?s=612x612&w=0&k=20&c=G6aeWKN1kHyaTxiNdToVW8_xGY0hcenWYIjjG_xwF_Q=",
  public_id: "default_product_image",
};

// =========================================================
// CREATE PRODUCT
// =========================================================
exports.createProduct = async (req, res) => {
  try {
    // Validate request body
    const { error } = createProductValidation.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        errors: error.details.map((d) => d.message),
      });
    }

    let uploadedImages = [];

    // If images uploaded via multer
    if (req.files && req.files.length > 0) {
      uploadedImages = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));
    } else {
      uploadedImages = [DEFAULT_IMAGE];
    }

    const product = new Product({
      ...req.body,
      images: uploadedImages,
      createdBy: req.user._id,
    });

    const savedProduct = await product.save();

    res.status(201).json({
      success: true,
      data: savedProduct,
    });
  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// =========================================================
// GET ALL PRODUCTS
// =========================================================
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error("Get All Products Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// =========================================================
// GET SINGLE PRODUCT
// =========================================================
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID required" });
    }

    const product = await Product.findById(id).populate(
      "createdBy",
      "name email role"
    );

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error("Get Product By ID Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// =========================================================
// UPDATE PRODUCT
// =========================================================
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID required" });
    }

    // Validation
    const { error } = updateProductValidation.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        errors: error.details.map((d) => d.message),
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    let newImages = product.images;

    // If new images uploaded → replace old images
    if (req.files && req.files.length > 0) {
      // Delete old Cloudinary images (except default)
      for (let img of product.images) {
        if (img.public_id !== "default_product_image") {
          await cloudinary.uploader.destroy(img.public_id);
        }
      }

      // Upload new images
      newImages = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        ...req.body,
        images: newImages,
        updatedAt: Date.now(),
      },
      { new: true }
    ).populate("createdBy", "name email role");

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// =========================================================
// DELETE PRODUCT
// =========================================================
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID required" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Delete Cloudinary images
    for (let img of product.images) {
      if (img.public_id !== "default_product_image") {
        await cloudinary.uploader.destroy(img.public_id);
      }
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
