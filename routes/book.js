import express from 'express';
import User from '../models/User';

import {authenticate} from '../middlewares/authenticate';

const router = express.Router();


router.get('/',authenticate,(req,res) => {

    res.json({});

});



export default router;