const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate.middleware");
const { createOrderSchema, updateOrderSchema } = require("../validations/order.validation");

// Create order (Admin, SubAdmin, TeamHead, Agent)
router.post(
  "/",
  auth,
  role(["admin", "subadmin", "teamhead", "agent"]),
  validate(createOrderSchema),
  orderController.createOrder
);

// Get all orders
router.get(
  "/orders-list",
  auth,
  role(["admin", "subadmin", "teamhead", "agent"]),
  orderController.getOrders
);

// Get order details by ID
router.get(
  "/order-details",
  auth,
  role(["admin", "subadmin", "teamhead", "agent"]),
  orderController.getOrderById
);

// Update order
router.put(
  "/update-order",
  auth,
  role(["admin", "subadmin", "teamhead", "agent"]),
  validate(updateOrderSchema),
  orderController.updateOrder
);

// Delete order
router.delete(
  "/delete-order",
  auth,
  role(["admin"]),
  orderController.deleteOrder
);

module.exports = router;
