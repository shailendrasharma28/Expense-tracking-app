const { Cashfree, CFEnvironment } = require("cashfree-pg");

const cashfree = new Cashfree(
  CFEnvironment.SANDBOX,
  "TEST430329ae80e0f32e41a393d78b923034",
  "TESTaf195616268bd6202eeb3bf8dc458956e7192a85"
);

const paymentController = {
  createPayment: async (req, res) => {
    const { phone } = req.body;
    const customer_id = req.user.id;

    const orderId = `order_${Date.now()}`;

    const request = {
      order_amount: 100.0,
      order_currency: "INR",
      order_id: orderId,
      customer_details: {
        customer_id: `user_${customer_id}`,
        customer_phone: phone,
      },
      order_meta: {
        return_url: `http://localhost:4000/payment/order/{order_id}`,
        payment_methods: "cc,dc,upi",
      },
      order_expiry_time: "2025-10-16T17:36:08.395Z",
    };

    try {
      const response = await cashfree.PGCreateOrder(request);

      console.log("Order created successfully:");
      res.status(200).json({
        sessionId: response.data.payment_session_id,
        orderId: response.data.order_id,
      });
    } catch (error) {
      console.error("Error creating order:", error.response.data.message);
      res.status(500).json({ error: "Payment session creation failed" });
    }
  },

  confirmOrder: async (req, res) => {
    const {order_id} = req.params;
    cashfree
      .PGOrderFetchPayments(order_id)
      .then((response) => {
        console.log("Order fetched successfully:");
      })
      .catch((error) => {
        console.error("Error:", error.response.data.message);
      });
    
    let getOrderResponse = []; //Get Order API Response
    let orderStatus;

    if (
      getOrderResponse.filter(
        (transaction) => transaction.payment_status === "SUCCESS"
      ).length > 0
    ) {
      orderStatus = "Success";
    } else if (
      getOrderResponse.filter(
        (transaction) => transaction.payment_status === "PENDING"
      ).length > 0
    ) {
      orderStatus = "Pending";
    } else {
      orderStatus = "Failure";
    }
    res.status(200).json({
        orderStatus
    })
  },
};

module.exports = paymentController;
