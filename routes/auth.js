import express from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import Validator from 'validator';

import {authenticate} from '../middlewares/authenticate';

import {responseErrorGlobal,responseErrorEmail} from '../utils/errors';

import {emailResetPasswordConfirm} from '../mail/auth/emailResetPasswordConfirm';
import {emailForgotPassword} from '../mail/auth/emailForgotPassword';

import {emailSignupConfirmation} from '../mail/auth/emailSignupConfirmation';
import {emailSignupUserConfirm} from '../mail/auth/emailSignupUserConfirm';

const router = express.Router();


router.post('/login',(req,res) => {

    const {email,password} = req.body.credentials;

    // ------- validation data
    const validationErrors = Array();
    
    if(!Validator.isEmail(email)) validationErrors.push("invalid email");
    if(!password) validationErrors.push("password is required");

    if(validationErrors.length > 0)
        return responseErrorGlobal(res,validationErrors);
    
    // ---------------
    
    User.findOne({email}).then(user => {

        if(!user || !user.confirmed || !user.isValidPassword(password) )
            return responseErrorGlobal(res,Array(`Invalid credentials`));

            user.setLoginSessionId();   // for authentication JWT

            user.save()
                .then(user=>{

                    if(!user)
                        return responseErrorGlobal(res,Array(`login invalid`));
            
                    //credentials OK;

                    const userObj = {
                        token:user.generateJWTUserLoginToken(), // token have expire time
                        logoutToken: user.generateJWTUserLoggedOutToken(),  // token don`t have expire time
                    };

                    res.json(userObj);
                    
                })
    })

});


router.post('/logout',(req,res) => {

    const logoutToken = req.body.logoutToken;  // logout token

    if(!logoutToken || logoutToken === 'undefined')
        return responseErrorGlobal(res,Array(`logout invalid`));

    jwt.verify(logoutToken,process.env.JWT_SECRET,(err,decodeJWT) => {

        if(err)
            return responseErrorGlobal(res,Array(`logout invalid`));

        User.findOne({loginSessionId:decodeJWT.sess}).then(user=>{

            if(!user)
                return responseErrorGlobal(res,Array(`logout invalid`));

            if(user._id != decodeJWT.id || user.email != decodeJWT.email)
                return responseErrorGlobal(res,Array(`logout invalid`));
            
            user.loginSessionId=''; // clean login session id

            user.save() // save updated data, and send email;
                .then(()=>{

                    res.json({});
                    
                });

        });

    });

});


router.post('/authentication_check',authenticate,(req,res) => {

    //get req.authenticatedUser from authenticate middleware
    const userObj = req.authenticatedUser;

    const user = {
        token:userObj.token,
        logoutToken: userObj.logoutToken
    };
    
    res.json(user);

});


// sigup_user_exists route use : signupform -> email field -> onBlur action, make ajax -> check if such email are in database
router.post('/signup_email_exists',(req,res) => {

    const email = req.body.email;

    // ------- validation start----------------------

    if(!Validator.isEmail(email))
        return responseErrorEmail(res,`Invalid email`); 

    // --------------- validation end-----------------

    User.findOne({email}).then(userEmail => {

        if(userEmail)   //if user email founded on database. 
            return responseErrorEmail(res,`email: ${email} is already taken`);      
 
        // such email don`t exists in db;

        res.json({});

    });

});


router.post('/signup',(req,res) => {

    const {email,password,passwordConf} = req.body.user;

    // ------- validation start------
    const validationErrors = Array();

    //note: errors list use array data structure
    if(!Validator.isEmail(email)) validationErrors.push("invalid email");
    if(password.length < 5) validationErrors.push("password must consist min 5 simbols");

    if(!Validator.equals(password,passwordConf)) validationErrors.push(`pasword isn\`t match`);

    //note: errors list use array data structure
    if(validationErrors.length > 0)  //if any error in the list
        return responseErrorGlobal(res,validationErrors);
    // --------------- validation end-----


    User.findOne({email}).then(userEmail => {

        if(userEmail)// user email founded in database. STOP signup process!!!
            return responseErrorGlobal(res,Array(`email: ${email} is already taken.`));
    
        const userObj = new User(); //db model User.js schema

        userObj.email = email;
        userObj.setPassword(password);  //making bcrypt(password); look func at user schema
        
        // note: for signuConfirmationToken field need current user id.
        // step 1: save email and passwword, and get saved user id;
        // step 2: generate and save signupConfirmationToken by user id;
        // step 3: send signup conformation token to email

        userObj.save()
            .then(user=>{

                if(!user)
                    return responseErrorGlobal(res,Array(`signup invalid`));

                //  find saved user in db, by user id; 
                User.findOne({_id:user._id}).then(userUpdate=>{

                    if(!userUpdate)
                        return responseErrorGlobal(res,Array(`signup invalid`));
                    
                    // make update user data

                    userUpdate.setSignupConfirmationToken();    //create signup confirmation token by saved user id,

                    // save signupConfirmationToken and then send email signup confirmation token link
                    userUpdate.save() 
                        .then(userConfEmail=>{

                            if(!userConfEmail)
                                return responseErrorGlobal(res,Array(`signup invalid`));

                            emailSignupConfirmation(userConfEmail); //send signup confirmation email link

                            res.json({});   // Signup process OK
                        });

                });


            });

    });
    

});




router.post('/signup_confirmation_token',(req,res) => {

    // email signupConfirmationToken link clicked -> 
    // front-end route page -> /signup_confirmation_token/:token" ->
    // front-end signup_confirmation_page take param :token -> call ajax to server-side;

    const token = req.body.token;

    // find email got signupConfirmationToken in database
    User.findOne({signupConfirmationToken:token}).then(user=>{
        
        if(!user)  // if not such user
            return responseErrorGlobal(res,Array(`signup invalid`));


        // check signupConfirmationToken saved in db, if its match env file JWT_SECRET
        jwt.verify(user.signupConfirmationToken,process.env.JWT_SECRET,(err,decodeJWT) => {

            if(err)
                return responseErrorGlobal(res,Array(`signup invalid`));
 

            //note important: id fields on user.id and decodedJWT.id have to be equals. its prove that same user;
            if(user._id != decodeJWT._id)
                return responseErrorGlobal(res,Array(`signup invalid`));


            // signupConfirmationToken JWT verification OK;
            // make data update and save;

            user.confirmed=true;    //note important: account confirmed to true; user can login to system yet;
            user.signupConfirmationToken='';  //note: remove token; make empty field;

            user.save() // save updated data, and send email;
                .then((userEmail)=>{
                    
                    if(!userEmail)
                        return responseErrorGlobal(res,Array(`signup invalid`));

                    emailSignupUserConfirm(userEmail); // send verification email, user successfully signed up. and can login into the system;

                    res.json({});
                });

        });
        

    })

});


router.post('/forgot_password',(req,res) =>{
    // forgotPasswordForm -> email input
    const email = req.body.email;

    // -----------------validation start-------------

    if(!Validator.isEmail(email)) 
        return responseErrorEmail(res,`email: ${email} is invalid`); 


    // --------------- validation end-----------------
    
    User.findOne({email}).then(user=>{

        if(!user)
            return responseErrorEmail(res,`email invalid. Make check your email is correct`); 

        // User OK;
        // make data updates;
        
        user.setResetPasswordToken();   // make jwtencode by user id;

        user.save() //save updates;
            .then((userEmail)=>{

                if(!userEmail)
                    return responseErrorGlobal(res,Array(`forgot password send invalid`));

                emailForgotPassword(userEmail); // send email resetPasswordToken link;

                res.json({})    // send OK;
            
            });

    })

});


router.post('/reset_password_token',(req,res) =>{
    // resetPassword email -> reset password link clicked
    const token = req.body.token;

    User.findOne({resetPasswordToken:token}).then(user=>{
        
        if(!user)
            return responseErrorGlobal(res,Array(`reset password token invalid`));


        jwt.verify(user.resetPasswordToken,process.env.JWT_SECRET,(err,decodeJWT)=>{

            if(err)
                return responseErrorGlobal(res,Array(`reset password token invalid`));

            if(user._id != decodeJWT._id)   // important: user id on db and jwt decoded id should be the same !!!
                return responseErrorGlobal(res,Array(`reset password token invalid`));

            res.json({});   // verificaton OK;

        });
        
    })

});


router.post('/reset_password',(req,res) =>{

    //resetPasswordForm
    const {password,passwordConfirm,token} = req.body.data;

    if(!token)
        return responseErrorGlobal(res,Array(`reset password invalid`));

    // -----------------validation start-------------
    const validationErrors = Array();

    if(password.length < 5) validationErrors.push(`password must consist min 5 simbols`);

    if(!Validator.equals(password,passwordConfirm)) validationErrors.push(`pasword isn\`t match`);
        

    if(validationErrors.length > 0) //if any validation error
        return responseErrorGlobal(res,validationErrors);

    // --------------- validation end-----------------


    User.findOne({resetPasswordToken:token}).then(user=>{

        if(!user)
            return responseErrorGlobal(res,Array(`reset password invalid`));


        jwt.verify(user.resetPasswordToken,process.env.JWT_SECRET,(err,decodeJWT)=>{

            if(err)
                return responseErrorGlobal(res,Array(`reset password invalid`));

            if(user._id != decodeJWT._id)
                return responseErrorGlobal(res,Array(`reset password invalid`));

            //JWT verification OK;
            //make user data update;
            
            user.setPassword(password);     //add new password bcrypted
            user.resetPasswordToken="";     // release resetPasswordToken. Make empty;

            user.save() // save updates
                .then((userEmail)=>{

                    if(!userEmail)
                        return responseErrorGlobal(res,Array(`reset password invalid`));

                    emailResetPasswordConfirm(userEmail);   // send password confirmation success email;

                    res.json({}); //successfully reset done;

                });

        });

    });
    
});

export default router;