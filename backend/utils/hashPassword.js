const bcrypt = require('bcryptjs');


const hashPassword = password =>bcrypt.hashSync(password,bcrypt.genSaltSync(10));

const comparePasswords = ( inputPassword, hashedPassword ) =>bcrypt.compareSync( inputPassword, hashedPassword)

module.exports = {hashPassword, comparePasswords};