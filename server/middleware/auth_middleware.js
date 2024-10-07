import appError from "../utils/appErro.js";
import jwt from "jsonwebtoken";
const isLoggedIn=function(req,res,next ){
    const {token}=req.cookies;
    if(!token){
        return next (new appError('Unauthenticated, please login',401));
    }
    const tokenDetails=jwt.verify(token,process.env.JWT_SECRET);
    if(!tokenDetails){
        return next (new appError('Unauthenticated, please login',401));
    }
    req.user=tokenDetails;
    next();
}
const authorisedRoles=(...roles)=>(req,res,next)=>{
    const currentRole=req.user.role;
    if(!roles.includes(currentRole)){
        return next (new appError('You donot have access to this route',403));
    }
    next();
}

export{
    isLoggedIn,
    authorisedRoles
}