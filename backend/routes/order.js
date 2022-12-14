const { getUserOrders, getUserOrder, createOrder, updateOrderPaid, updateOrderDelivered, getOrdersAdmin, getOrdersAnalysis } = require('../controllers/order');
const { verifyLoggedin, verifyIsAdmin } = require('../middleware/verifyLoggedin');

const orderRouter = require('express').Router();

// user routes
orderRouter.use(verifyLoggedin)
orderRouter.get('/', getUserOrders)
                .get('/user/:id', getUserOrder)
                .post('/', createOrder)
                .put("/product/:id", updateOrderPaid)

//admin routes
orderRouter.use( verifyIsAdmin )
orderRouter.get('/admin', getOrdersAdmin)
                   .put('/delivered/:id', updateOrderDelivered)
                   .get('/analysis/:date', getOrdersAnalysis)

module.exports = orderRouter;
