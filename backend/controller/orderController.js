const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

// create new order
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id,
  });

  res.status(200).json({
    success: true,
    order,
  });
});

// get logged in user order
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.find({ user: req.user._id });

  if (!order) {
    next(new ErrorHandler(`No orders`, 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// get single order -- admin
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );
  // populate => will find name and email of user from the user id (ref)

  if (!order) {
    next(new ErrorHandler(`Order not found with id ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// get all orders -- admin
exports.getAllOrder = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find();
  if (!orders) {
    next(new ErrorHandler(`No orders`, 404));
  }

  let totalAmount = 0;
  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

// update order status -- admin
exports.updateOrderStatus = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    next(new ErrorHandler(`Order not found with id ${req.params.id}`, 404));
  }
  if (order.orderStatus === "Delivered") {
    return next(
      new ErrorHandler(
        `You have already delivered this order with id ${req.params.id}`,
        400
      )
    );
  }

  order.orderItems.forEach(async (order) => {
    await updateStock(order.product, order.quantity);
  });

  order.orderStatus = req.body.status;

  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

async function updateStock(id, quantity) {
  const product = await Product.findById(id);
  product.stock -= quantity;
  await product.save({ validateBeforeSave: false });
}

// delete order -- admin
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    next(new ErrorHandler(`Order not found with id ${req.params.id}`, 404));
  }
  await order.remove();

  res.status(200).json({
    success: true,
  });
});
