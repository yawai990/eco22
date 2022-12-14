const { getProducts , getProductById , getBestsellers , adminGetProducts , adminDeleteProduct, adminCreateProduct, adminUpdateProduct, adminFileUpload, adminDeleteProductImage  } = require('../controllers/product');
const { verifyLoggedin, verifyIsAdmin } = require('../middleware/verifyLoggedin');

const productRouter = require('express').Router();


//user routes
productRouter.get('/',getProducts)
                        .get('/bestsellers',getBestsellers) 
                        .get('/category/:categoryName',getProducts)
                        .get('/category/:categoryName/search/:searchQuery',getProducts)
                        .get('/search/:searchQuery',getProducts)
                        .get('/get-one/:id',getProductById)
  
//admin routes
productRouter.use( verifyLoggedin )
productRouter.use( verifyIsAdmin)
productRouter.get('/admin', adminGetProducts)
                        .post('/admin', adminCreateProduct)
                        .post('/admin/fileupload', adminFileUpload)
                        .put('/admin/:id', adminUpdateProduct)
                        .delete('/admin/:id',adminDeleteProduct)
                        .delete('/admin/image/:imagePath/:productId',adminDeleteProductImage)

module.exports = productRouter;