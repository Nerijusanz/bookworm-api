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
    const bearerToken = bearer[1];  // token is second param
    
    if(!bearerToken)
        return responseErrorGlobal(res,Array(`Authorization forbidden`));


    jwt.verify(bearerToken,process.env.JWT_SECRET,(err,decodeJWT)=>{

        if(err)
            return responseErrorGlobal(res,Array(`Authorization forbidden`));


        if(!decodeJWT.id || !decodeJWT.password_public )
            return responseErrorGlobal(res,Array(`Authorization forbidden`));


        User.findOne({_id:decodeJWT.id}).then(user=>{
        
            if(!user || !user.confirmed )
                return responseErrorGlobal(res,Array(`Authorization forbidden`));


            //note: password_public maked: bcrypt.hashSync(this.passwordHash,10);
            if(!bcrypt.compareSync(user.passwordHash,decodeJWT.password_public))
                return responseErrorGlobal(res,Array(`Authorization forbidden`));


            // add cuurent user token into route
            req.authenticatedToken = bearerToken;

            next(); // -> OK; go to route
            

        })

    });

    
}
