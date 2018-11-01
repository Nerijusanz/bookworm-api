import express from 'express';
import User from '../models/User';

import {authenticate} from '../middlewares/authenticate';

const router = express.Router();

// turn on authentication middleware all books routes
router.use(authenticate);


router.get('/',(req,res) => {

    res.json({});

});


router.get('/search',(req,res) => {

    const query = req.query.q;  //search?q= 
    // make database search, or api serach

    //simulation data
    const data={
        books:[
            {
                goodreadsId:1,
                title:"wordpress For Dummies",
                author:"Lisa Sabin-Wilson",
                covers:[
                    'https://images.gr-assets.com/books/1179261815l/894766.jpg',
                    'https://images.gr-assets.com/books/1348477206l/10282865.jpg'
                ],
                pages:384
            },
            {
                goodreadsId:2,
                title:"Professional Wordpress Plugin Development",
                author:"Brad Williams Ozh Richard, Justin Tadlock",
                covers:[
                    'https://images.gr-assets.com/books/1348477206l/10282865.jpg',
                    'https://images.gr-assets.com/books/1179261815l/894766.jpg',

                ],
                pages:552
            }
        ]
    };



    res.json(data);

});



export default router;