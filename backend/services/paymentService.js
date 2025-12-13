const { Cashfree, CFEnvironment } = require("cashfree-pg");

const cashfree = new Cashfree(
  CFEnvironment.SANDBOX,
  process.env.CASHFREE_APP_ID,
  process.env.CASHFREE_SECRET_KEY
);

const createNewOrder = async (
  amount,
  orderId,
  customerId,
  customerPhone = "9351943369"
) => {
  try {
    const expiry = new Date(Date.now() + 60 * 60 * 1000);
    const request = {
      order_amount: amount,
      order_currency: "INR",
      order_id: orderId,
      customer_details: {
        customer_id: customerId,
        customer_phone: customerPhone,
      },
      order_meta: {
        return_url: `http://localhost:4000/payment/order/{order_id}`,
        payment_methods: "cc,dc,upi",
      },
      order_expiry_time: expiry,
    };

    const response = await cashfree.PGCreateOrder(request);

    console.log("Order created successfully:");
    return response.data.payment_session_id;
  } catch (error) {
    console.log(error);

    throw new Error("Error creating order", error);
  }
};

const orderStatus = async (order_id) => {
  try {
    const response = await cashfree.PGOrderFetchPayments(order_id);

    const getOrderResponse = response.data || [];

    let orderStatus;

    if (
      getOrderResponse.some(
        (transaction) => transaction.payment_status === "SUCCESS"
      )
    ) {
      orderStatus = "Success";
    } else if (
      getOrderResponse.some(
        (transaction) => transaction.payment_status === "PENDING"
      )
    ) {
      orderStatus = "Pending";
    } else {
      orderStatus = "Failure";
    }
    return {
        getOrderResponse,
        orderStatus
    };
  } catch (error) {
    throw new Error("Error fetching order status!", error);
  }
};

module.exports = { createNewOrder, orderStatus };
