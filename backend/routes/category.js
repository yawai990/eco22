const {getCategory,newCategory,deleteCategory,saveAttr} = require('../controllers/category');
const { verifyLoggedin, verifyIsAdmin } = require('../middleware/verifyLoggedin');

const categoryRouter = require('express').Router();

categoryRouter.get('/',getCategory)

categoryRouter.use( verifyLoggedin)
                        .use( verifyIsAdmin )
categoryRouter.post('/',newCategory)
                        .delete('/:category',deleteCategory)
                        .post("/attr",saveAttr)

module.exports = categoryRouter;
