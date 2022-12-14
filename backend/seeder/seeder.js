const connectDB = require('../config/db');
connectDB();

const categoriesData  = require('./categories');
const productsData = require('./products');
const reviewsData = require('./reviews');
const usersData = require('./user');
const ordersData=  require('./orders');

const Category = require('../models/CategoryModel');
const Product = require('../models/productsModel');
const Review = require('../models/reviewModel');
const User = require('../models/UserModel');
const Order= require('../models/OrderModel');

const importData = async()=>{
    try {

        //dropindexes like in TRUNCATE TABLE table_name
        await Category.collection.dropIndexes();
        await Product.collection.dropIndexes();
        await Review.collection.dropIndexes();
        await User.collection.dropIndexes();
        await Order.collection.dropIndexes();

        //delete all the categorie data in the collection
        await Category.collection.deleteMany({});
        await Product.collection.deleteMany({});
        await Review.collection.deleteMany({});
        await User.collection.deleteMany({});
        await Order.collection.deleteMany({});

        await Category.insertMany(categoriesData); 

       const reviews = await Review.insertMany(reviewsData); 

       const sampleProducts = productsData.map(product=>{
        reviews.map(review=>{
            product.reviews.push(review._id)
        });

        return {...product}
       });

       await Product.insertMany(sampleProducts); 
       await User.insertMany(usersData); 
       await Order.insertMany(ordersData); 

        console.log('seeder data proceeded successfully');
        process.exit()
    } catch (error) {
            console.log('Error while processing seeder data',error);
            process.exit(1) // 1 means there was some errors 
    }
};
importData();