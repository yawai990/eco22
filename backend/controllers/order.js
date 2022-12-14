const Order = require('../models/OrderModel');
const Product = require('../models/productsModel');
const ObjectId = require('mongodb').ObjectId;

const getUserOrders=async ( req, res, next)=>{

    try {
        const orders = await Order.find( { user: ObjectId( req.user._id ) } );

        res.send(orders)
    } catch (error) {
        next(error)
    }
 };
 
 const getUserOrder = async ( req, res, next )=>{
    try {
        const id = req.params.id;

        const order = await Order.findById(id).populate('user', '-password -admin -_id -__v -createdAt -updateAt').orFail();    

        res.send(order)
    } catch (error) {
        next(error)
    }
 };

 const createOrder  = async ( req, res, next )=>{
    try {
        const { cartItems, orderTotal, paymentMethod } = req.body;

        if ( !cartItems || !orderTotal || !paymentMethod ) {
            return res.status(400).send('All inputs are required')
        };

        const cartProductId = cartItems.map( item=>item.productID );

        const qty = cartItems.map( item=> Number( item.quantity ) );

        await Product.find( { _id : { $in : cartProductId } } )
        .then(products =>{
            products.forEach(( product, ind ) =>{
                product.sales += qty[ind];
                product.save() 
            });
        });

        const order =await new Order({
            user : ObjectId(req.user._id),
            orderTotal,
            cartItems,
            paymentMethod
        });

        const createOrder = await order.save();

        res.status(201).send(createOrder);

    } catch (error) {
        next(error)
    }
 };

 const updateOrderPaid = async ( req, res, next )=>{
    try {
        const id = req.params.id;

       const orderProduct = await Order.findById(id).orFail();

        orderProduct.isPaid = true;
        orderProduct.paidAt = Date.now();   

       const orderPaid = await orderProduct.save()

       res.send(orderPaid) ;
    } catch (error) {
        next(error)
    }
 };

 const updateOrderDelivered = async ( req, res, next )=>{
    try {
        const id = req.params.id; 

        const orderProduct = await Order.findById(id).orFail();

        orderProduct.isDelivered = true;
        orderProduct.deliveredAt = Date.now();

        await orderProduct.save();

        res.send("Product is delivered")
    } catch (error) {
        next(error)
    }
 };

 const getOrdersAdmin = async ( req, res, next ) =>{
    try {
       const orders = await Order.find().populate('user', '-password').sort({
        paymentMethod: 'desc'
       });
       
       res.send(orders)
    } catch (error) {
        next(error)
    }
 };

 const getOrdersAnalysis = async ( req, res, next ) =>{
    try {
        const date = req.params.date;

        let start = new Date(date);
        start.setUTCHours(0 ,0 ,0 , 0)
        
        const end = new Date(date);
        end.setUTCHours(23,59,59,999);


        const orders = await Order.find({
            createdAt: {
                $gte : start,
                $lte : end
            }
        }).sort( { createdAt : 'asc'});

        res.send(orders)
        
    } catch (error) {
        next(error)
    }
 }

 module.exports = { getUserOrders, getUserOrder, createOrder, updateOrderPaid, updateOrderDelivered, getOrdersAdmin, getOrdersAnalysis }
 