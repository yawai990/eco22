const { getUsers, registerUser, loginUser, updateProfile, getUserProfile, writeReview, getUser, updateUser, deleteUser }    = require('../controllers/user');
const { verifyIsAdmin, verifyLoggedin } = require('../middleware/verifyLoggedin');

const userRouter = require('express').Router();

userRouter.post('/register',registerUser)
                 .post('/login',loginUser)


//user login routes
userRouter.use( verifyLoggedin )
userRouter.put('/profile',updateProfile)
                 .get('/profile/:id', getUserProfile)
                 .post('/review/:productId', writeReview)

//admin login routes
userRouter.use( verifyIsAdmin)
userRouter.get('/',getUsers)
                 .get('/:id', getUser)
                 .put('/:id', updateUser)
                 .delete('/:id', deleteUser)

module.exports = userRouter;
