const express = require('express');
const helmet = require('helmet');
const dotenv = require('dotenv');
const apiRouter = require('./routes/apiRoute');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');

dotenv.config();
const PORT = process.env.PORT || 5000;

const app = express();

app.use(helmet());
//to get the form data from frontend
app.use(fileUpload());
app.use(express.json());
app.use(bodyParser.json({extended:true}));
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());

app.get('/',(req,res)=>{
    res.json('App is running')
});

app.get('/a',(req,res,next)=>{
    setTimeout(()=>{
        res.statusCode = 400;
        next(new Error('some error occured'))
    },2000);
});

app.use((err,req,res,next)=>{
    if(err){
        next(err)
    }
});

//database
require('./config/db')();

app.use("/api",apiRouter);

//error
app.use(require('./middleware/errorHandler'));

app.listen(PORT,()=>console.log(`server is running in ${PORT}`))