const User = require('../models/UserModel');
const {hashPassword, comparePasswords} = require('../utils/hashPassword');
const generateToken = require('../utils/generateToken');
const Review = require('../models/reviewModel');
const Product = require('../models/productsModel');

const getUsers=async ( req, res, next)=>{
   try {    
    const users = await User.find().select(' -password ')
 
    res.json(users)

   } catch (error) {
    next(error)
   }
 };

 const registerUser = async ( req, res, next )=>{
    try {

        const { name, lastName, email, password } = req.body;

        if( ! ( name && lastName && email && password ) ) return res.status(400).send( 'All fields are required.' );

        const userExist = await User.findOne({ email }) ;

        if(userExist ){
             return res.status(400).send( 'user already exist with that email' )
        }else{

            const hashedPassword = hashPassword(password)

            const user = await User.create({
                name, 
                lastName ,
                 email: email.toLowerCase(), 
                password : hashedPassword
            });

            res
            .cookie("access_token", generateToken(
                user._id,
                user.name,
                user.lastName,
                user.email,
                 user.isAdmin),{
                httpOnly : true,
                secure : process.env.NODE_ENV === 'production',
                sameSite : 'strict'
            })
            .status(201)
            .json({
                success: 'User created',
                userCreated:{
                    _id : user._id,
                    name: user.name,
                    lastName : user.lastName,
                    email: user.email,
                    isAdmin : user.isAdmin
                }
            })
        }
        
    } catch (error) {
        next(error)
    }
 };

 const loginUser = async ( req, res, next )=>{
    try {

        const { email, password, doNotLogout } = req.body;

            if( !(email && password )) {
            return res.status(400).send('All fields are required')
        };

        //find the user in the database 
        const user =await User.findOne({ email });

        
        if( user ){

                        //compare password 
            const isMatch = comparePasswords(password, user.password);

            if( isMatch ){

            let cookieParams = {
                httpOnly : true,
                secure : process.env.NODE_ENV === 'production',
                sameSite : 'strict'
            };

            if( doNotLogout ){
                cookieParams = { ...cookieParams, maxAge: 1000 * 60 * 60 * 24 * 7 }
            };

            return res.cookie('access_token', 
            generateToken(user._id, user.name, user.lastName, user.email, user.isAdmin),
            cookieParams
            ).json({
                success : 'User Logged in',
                userLoggedIn : {
                    _id : user._id,
                    name : user.name,
                    lastName : user.lastName ,
                    email : user.email,
                    isAdmin : user.isAdmin,
                    doNotLogout
                }
            });
        }else{
            return res.status(401).send('Wrong credentials')
        };

        }else{
            return res.status(401).send('User account does not exist with that email')
        }

    } catch (error) {
            next(error)
    }
 };

 const updateProfile = async ( req, res, next ) =>{
    try {

            const { name, lastName, email, phoneNumber, address, country, zipCode, city, state } = req.body;

            const user  = await User.findById(req.user._id ).orFail();

            user.name = name || user.name;
            user.lastName = lastName || user.lastName;
            user.email = email || user.email;
            user.phoneNumber = phoneNumber || user.phoneNumber;
            user.address = address || user.address;
            user.country = country || user.country;
            user.zipCode = zipCode || user.zipCode;
            user.city = city || user.city;
            user.state = state || user.state;


            //change password
            if( req.body.password && req.body.password !== user.password ){
                user.password = hashPassword(req.body.password )
            };

            // updated the database's data
            await user.save()

            res.json({
                success : 'User updated',
                userUpdated : {
                     _id : user._id,
                     name : user.name,
                     lastName: user.lastName,
                     email : user.email,
                     isAdmin : user.isAdmin
                }
            })

    } catch (error) {
        next(error)
    }
 };

 const getUserProfile = async ( req, res, next )=>{
    try {
            const id = req.params.id;

            const user = await User.findById(id).orFail().select('-password');

            res.send(user)

    } catch (error) {
            next(error)
    }
 };

 const writeReview = async ( req, res, next )=>{
     //when someone write a review the collections should be updated;
     const session = await Review.startSession();

    try {

        const { comment, rating } = req.body;

        if( ! (comment && rating)) return res.statuse(400).send( "All fields are required.")


        //get the id from mongodb
        const objectId = require('mongodb').ObjectId;

        //create the id from review automatically
        const reviewId = objectId();


        //this is database operation
        session.startTransaction();

        await Review.create([
            {
                _id : reviewId,
                comment,
                rating: Number(rating),
                user : { 
                    _id : req.user._id, 
                    name : `${req.user.name} ${req.user.lastName}`
                }
            }
        ], { session });

        const product = await Product.findById(req.params.productId).populate('reviews').session(session);

        const alreadyReviewed = await product.reviews.find(review => review.user._id.toString() === req.user._id.toString() );


        if( alreadyReviewed ) {
            await session.abortTransaction();
            session.endSession()
            return res.status(400).send('Product already reviewed')
        }

        const prc = [ ...product.reviews];  // id who wrote an review the product

             prc.push( { rating });

        product.reviews.push(reviewId)

        if( product.reviews.length === 1 ){
            product.rating = Number( rating );
            product.reviewsNumber = 1 ;
        }else{
            product.reviewsNumber = product.reviews.length;
            let ratingCalc = prc.map( item => Number( item.rating )).reduce( (sum,item) => sum + item , 0 ) / product.reviews.length;  // average rating for the product
            product.rating = Math.round(ratingCalc)
        };

        await product.save();

        await session.commitTransaction();
        session.endSession()

        res.send('review created')

    } catch (error) {
        await session.abortTransaction();
        session.endSession()
        next(error)
    }
 };

 const getUser = async ( req, res, next )=>{
    try {
        const id = req.params.id;

        const user = await User.findById(id).orFail().select('_id name email lastName isAdmin');

        res.send(user)
    } catch (error) {
        next(error)
    }
 }

 const updateUser = async ( req, res, next )=>{
    try {
            const { name, lastName, email, isAdmin } =req.body;

            const id = req.params.id;
            
            const user = await User.findById(id).orFail();

            user.name = name || user.name;
            user.lastName = lastName || user.lastName;
            user.email = email || user.email;
            user.isAdmin = isAdmin;

            await user.save()

            res.send('user updated')

    } catch (error) {
        next(error)
    }
 };

 const deleteUser = async ( req, res, next ) =>{
    try {
        const id =req.params.id;

        const user = await User.findById(id).orFail();

        user.remove();

        res.send('user deleted')

    } catch (error) {
        next(error)
    }
 }
 
 module.exports = { getUsers, registerUser, loginUser, updateProfile, getUserProfile, writeReview, getUser, updateUser, deleteUser };
 