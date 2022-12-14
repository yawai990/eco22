const jwt = require('jsonwebtoken');

const verifyLoggedin = async ( req, res, next ) =>{

    try {   
        const token = req.cookies.access_token;

        if( !token ) return res.status(403).send('Not authenticate')

        try {
                const decoded = jwt.verify(token,process.env.JWT_SECRET);

                    req.user = decoded
                next()
        } catch (error) {
           res.status(401).send("Unauthorized. Invalid Token")
        }
    } catch (error) {
        next(error)
    }
};

const verifyIsAdmin = async ( req, res, next )=>{

    if(req.user && req.user.isAdmin ){
        next()
    }else{
        return res.status(401).send('Unauthorized. Your are not admin')
    }
}

module.exports = { verifyLoggedin, verifyIsAdmin };