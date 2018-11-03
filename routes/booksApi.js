import express from 'express';

import {authenticate} from '../middlewares/authenticate';
import {responseErrorGlobal} from '../utils/errors';

const router = express.Router();

// turn on authentication middleware all books routes
router.use(authenticate);



router.get('/search',(req,res) => {
    // books api search !!!
    const searchQuery = req.query.q; //search?q= 

    const books = apiBooks();   // fake api books

    const data = {
        books:[]
    }

    if(searchQuery == '') return res.json(data).end();

    // search validation OK;

    const filterBooks = books.filter(book=>{

        const title = book.title.toLowerCase();

        const foundStatus = title.includes( searchQuery.toLowerCase() );    // function includes() return true if founded. false if not;

        return foundStatus;
    });


    data.books = filterBooks;
    
    res.json(data);

});


function apiBooks(){

        return Array(
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
            },
            {
                goodreadsId:3,
                title:"Programming PHP",
                author:"Rasmus Lerdorf",
                covers:[
                    'https://images.gr-assets.com/books/1328834352l/136863.jpg',

                ],
                pages:542
            },
            {
                goodreadsId:4,
                title:"PHP & MySQL ",
                author:"Lynn Beighley",
                covers:[
                    'https://images.gr-assets.com/books/1328834323l/3264934.jpg',

                ],
                pages:814
            }
        );

}

export default router;