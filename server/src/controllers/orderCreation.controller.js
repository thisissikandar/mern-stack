import { instance } from "../constants.js";

const orderCreation = (req, res, next) => {
  try {
    var options = {
      amount: 50000, // amount in the smallest currency unit
      currency: "INR",
      receipt: "order_rcptid_11",
    };
    instance.orders.create(options, function (err, order) {
      console.log(order);
      res.status(200).json({ message: "order creation", order });
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export default orderCreation;