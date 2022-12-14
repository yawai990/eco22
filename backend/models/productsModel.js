const mongoose = require('mongoose');
const Review=  require('./reviewModel');

const imageSchema =mongoose.Schema({
    path:{type:String,required:true}
})

const productSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        uniqie:true
    },
    description:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    //product stock
    count:{
        type:Number,
        required:true
    },
    price:{
        type:Number, 
        required:true
    },
    rating:{
        type:Number
    },
    reviewsNumber:{
        type:Number
    },
    sales:{
         type:Number,
         default:0
    },
    attrs:[
        {
            key:{type:String},
            value:{type:String}
        }
    ],
    images:[imageSchema],

    //one product would have many reviews
    reviews:[{
        type : mongoose.Schema.Types.ObjectId,
        ref : Review
    }]
},{
    timestamps:true
});

const Product = mongoose.model('Products',productSchema);
productSchema.index({"attr.key":1,"attr.value":1})
productSchema.index({name:"text",description:"text"},{name:"TextIndex"});

module.exports = Product;