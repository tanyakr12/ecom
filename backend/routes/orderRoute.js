const express = require("express");
const {
  newOrder,
  getSingleOrder,
  myOrders,
  getAllOrder,
  updateOrderStatus,
  deleteOrder,
} = require("../controller/orderController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const router = express.Router();

router.route("/order/new").post(isAuthenticatedUser, newOrder);
router.route("/order/me").get(isAuthenticatedUser, myOrders);

router
  .route("/admin/order/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getSingleOrder)
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateOrderStatus)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteOrder);

router
  .route("/admin/orders")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAllOrder);

module.exports = router;
