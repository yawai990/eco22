const productRouter = require('./product');
const categoryRouter = require('./category');
const userRouter = require('./user');
const orderRouter = require('./order');
const apiRouter = require('express').Router();

const jwt = require('jsonwebtoken');

apiRouter.get('/get-token',( req, res, next )=>{
    try {
            const accessToken =  req.cookies['access_token'];

            const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

            return res.json({ token : decoded.name, isAdmin : decoded.isAdmin});
    } catch (error) {
        return res.status(401).send('Unauthorized. Invalid token')
    }
});

//logout 
apiRouter.get('/logout',(req,res)=>{

    // res.clearCookie('access_token').send('access token cleared')
    res.clearCookie('access_token');
    res.send('access token cleared')
    res.end()
});

apiRouter.use('/products',productRouter);
apiRouter.use('/categories',categoryRouter);
apiRouter.use('/users',userRouter);
apiRouter.use('/orders',orderRouter);

module.exports = apiRouter;