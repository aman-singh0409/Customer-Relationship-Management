const express = require("express");
const router = express.Router();

const productCtrl = require("../controllers/product.controller");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const upload = require("../config/multer");

// ----------------------------------------------
// CREATE PRODUCT (admin only)
// ----------------------------------------------
router.post(
  "/adminCreate",
  auth,
  role(["admin"]),
  upload.array("images", 5),        
  productCtrl.createProduct
);

// ----------------------------------------------
// GET ALL PRODUCTS
// ----------------------------------------------
router.get(
  "/getAll",
  auth,
  role(["admin", "subadmin", "teamhead", "agent"]),
  productCtrl.getAllProducts
);

// ----------------------------------------------
// GET SINGLE PRODUCT
// ----------------------------------------------
router.post(
  "/getOne",
  auth,
  role(["admin", "subadmin", "teamhead", "agent"]),
  productCtrl.getProductById
);

// ----------------------------------------------
// UPDATE PRODUCT
// ----------------------------------------------
router.put(
  "/adminUpdate",
  auth,
  role(["admin", "subadmin"]),
  upload.array("images", 5),        // <== Multer added
  productCtrl.updateProduct
);

// ----------------------------------------------
// DELETE PRODUCT
// ----------------------------------------------
router.delete(
  "/adminDelete",
  auth,
  role(["admin"]),
  productCtrl.deleteProduct
);

module.exports = router;
