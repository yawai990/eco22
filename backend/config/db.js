require('dotenv').config();

const mongoose = require('mongoose');

const connectDB =async (next)=>{
    try {
         await mongoose.connect(process.env.MONGODB_URI,{
            useNewUrlParser:true,
            useUnifiedTopology:true
        })

        console.log('db connected')
      
    } catch (error) {
       console.log('db connection failed')
    };
};

module.exports = connectDB;