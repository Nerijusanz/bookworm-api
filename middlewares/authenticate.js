import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import User from '../models/User';

import {responseErrorGlobal} from '../utils/errors';


const responseError = (res) => {

    return responseErrorGlobal(res,Array(`Authorization forbidden`));

}


export const authenticate = (req,res,next)=>{

    //get req. auth header 
    const bearerHeader = req.headers['authorization']; // note: on server header "authorization" first letter is lowercase!!;

    if(!bearerHeader || typeof bearerHeader === 'undefined') return responseError(res);

    // Authorization structure: Bearer <access token>
    // split space
    const bearer = bearerHeader.split(' '); // split space gap

    if(bearer[0] !== 'Bearer')  return responseError(res);

    if(!bearer[1])  return responseError(res);

    const bearerToken = bearer[1];  // token param


    jwt.verify(bearerToken,process.env.JWT_SECRET,(err,decodeJWT)=>{

        if(err) return responseError(res);

        if(!decodeJWT.id || !decodeJWT.email || !decodeJWT.session ) return responseError(res);


        User.findOne({_id:decodeJWT.id}).then(user=>{
        
            if(!user || !user.confirmed ) return responseError(res);

                // note: on logedout action loginSessionId is empty;
                //validate email, loginSessionId
            if( user.email != decodeJWT.email || user.loginSessionId == '' || user.loginSessionId != decodeJWT.session ) return responseError(res);

            
            const userObj={
                token:user.generateJWTUserLoginToken(),
                logoutToken: user.generateJWTUserLoggedOutToken(),
            };

            req.authenticatedUser = userObj; // append data to route

            next(); // -> authentication done OK; go to route
            

        })

    });

    
}
