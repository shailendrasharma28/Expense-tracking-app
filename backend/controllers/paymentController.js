const Payment = require("../models/paymentModel");
const User = require("../models/userModel");
const {createNewOrder, orderStatus} = require("../services/paymentService")

const paymentController = {
  createPayment: async (req, res) => {
    const customerId = req.user.id;
    const customerPhone = req.user.mobile;
    const orderId = `order_${Date.now()}`;
    const amount = 200.00
    try {
        const initiatePaymentSession = await createNewOrder(amount, orderId, customerId, customerPhone)
        console.log(initiatePaymentSession);
        
      const createOrder = await Payment.create({
        user_id: customerId,
        order_id: orderId,
        payment_status: "Initiated",
        payment_session_id: initiatePaymentSession,
        order_amount: amount
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
      
      await Payment.update(
        { 
            payment_status: response.orderStatus,
            payment_id: paymentId
        },
        { where: { order_id: order_id } }
      );

      if(response.orderStatus === "Success"){
        const user = await User.findOne({
            include: {model: Payment, attributes: ["id", "user_id"], where: {order_id: order_id}}
        });
        console.log(user);
        
        user.update({is_premium: true})
      }
      res.status(200).json({
        success: true,
        order_id,
        orderStatus: response.orderStatus,
        transactions: response.getOrderResponse,
      });
    } catch (error) {
      console.error(
        "Error fetching order:",
        error.response?.data || error.message
      );
      res.status(500).json({
        success: false,
        message: "Error verifying payment",
        error: error.response?.data || error.message,
      });
    }
  },
};

module.exports = paymentController;
