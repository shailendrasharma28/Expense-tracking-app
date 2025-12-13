const Payment = require("../models/paymentModel");
const User = require("../models/userModel");
const { createNewOrder, orderStatus } = require("../services/paymentService");

const paymentController = {
  createPayment: async (req, res) => {
    const customerId = req.user._id; 
    const customerPhone = req.user.mobile;
    const orderId = `order_${Date.now()}`;
    const amount = 200.00;

    try {
      const initiatePaymentSession = await createNewOrder(amount, orderId, customerId, customerPhone);
      console.log(initiatePaymentSession);

      const createOrder = await Payment.create({
        user_id: customerId,
        order_id: orderId,
        payment_status: "Initiated",
        payment_session_id: initiatePaymentSession,
        order_amount: amount,
      });

      res.status(200).json({
        sessionId: initiatePaymentSession,
      });
    } catch (error) {
      console.error("Error creating order:", error.message);
      res.status(500).json({ error: "Payment session creation failed" });
    }
  },

  confirmOrder: async (req, res) => {
    try {
      const { order_id } = req.params;
      const response = await orderStatus(order_id);
      const paymentId = response.getOrderResponse[0].cf_payment_id;

      // Mongoose me updateOne use karenge
      const updatedPayment = await Payment.findOneAndUpdate(
        { order_id },
        {
          payment_status: response.orderStatus,
          payment_id: paymentId,
        },
        { new: true }
      );

      if (!updatedPayment) {
        return res.status(404).json({
          success: false,
          message: "Payment not found",
        });
      }

      if (response.orderStatus === "Success") {
        const user = await User.findById(updatedPayment.user_id);
        
        if (user) {
          user.isPremium = true;
          await user.save();
        }
      }

      res.status(200).json({
        success: true,
        order_id,
        orderStatus: response.orderStatus,
        transactions: response.getOrderResponse,
      });
    } catch (error) {
      console.error("Error fetching order:", error.response?.data || error.message);
      res.status(500).json({
        success: false,
        message: "Error verifying payment",
        error: error.response?.data || error.message,
      });
    }
  },
};

module.exports = paymentController;
