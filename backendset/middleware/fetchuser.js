const jwt =  require('jsonwebtoken');
const JWT_SECRET = "harryisagoog#@boy"


const fetchuser = (req, res, next)=>{
    //get the user from ths jwt token and append id to req obj
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({error : 'please authenticate with valid token'})
    }
    try {
        const data = jwt.verify(token, JWT_SECRET)
        req.user = data.user
        next();
    } catch (error) {
        console.log(error.message)
        res.status(401).send({error : 'please authenticate with valid token'})
    }
    
}


module.exports = fetchuser;