import express from 'express';
import User from '../models/User';


import {authenticate} from '../middlewares/authenticate';

// import {responseError} from '../utils/errors';

const router = express.Router();


router.get('/',authenticate,(req,res) => {

    /*const token = req.authenticatedToken;  //get authenticatedUser from authenticate

    // make call in db by authenticatedUser

    res.json({
        token
    });*/

    res.json({});

});

export default router;

