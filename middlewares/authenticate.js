import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import User from '../models/User';

import {responseErrorGlobal} from '../utils/errors';



export const authenticate = (req,res,next)=>{

    //get auth header 
    const bearerHeader = req.headers['authorization']; // note: on server header "authorization" first letter is lowercase!!;

    if(!bearerHeader || typeof bearerHeader === 'undefined')
        return responseErrorGlobal(res,Array(`Authorization forbidden`));


    // Authorization structure: Bearer <access token>
    // split space
    const bearer = bearerHeader.split(' '); // split space gap

    if(bearer[0] !== 'Bearer')
        return responseErrorGlobal(res,Array(`Authorization forbidden`));

    if(!bearer[1])
        return responseErrorGlobal(res,Array(`Authorization forbidden`));

    const bearerToken = bearer[1];  // token param


    jwt.verify(bearerToken,process.env.JWT_SECRET,(err,decodeJWT)=>{

        if(err)
            return responseErrorGlobal(res,Array(`Authorization forbidden`));


        if(!decodeJWT.id || !decodeJWT.sess )
            return responseErrorGlobal(res,Array(`Authorization forbidden`));


        User.findOne({_id:decodeJWT.id}).then(user=>{
        
            if(!user || !user.confirmed )
                return responseErrorGlobal(res,Array(`Authorization forbidden`));

            if(user.loginSessionId == '' || user.loginSessionId !== decodeJWT.sess)
                return responseErrorGlobal(res,Array(`Authorization forbidden`));

            // add cuurent user token into route
            // req.authenticatedToken = bearerToken;
            req.authenticatedToken = user.generateJWTUserLoginToken();
            req.authenticatedLogoutToken = user.generateJWTUserLoggedOutToken();

            next(); // -> OK; go to route
            

        })

    });

    
}
