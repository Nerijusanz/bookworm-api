import express from 'express';
import Books from '../models/Books';

import {authenticate} from '../middlewares/authenticate';
import {responseErrorGlobal} from '../utils/errors';

const router = express.Router();

// turn on authentication middleware all books routes
router.use(authenticate);


router.get('/',(req,res) => {

    Books.find({userId: req.authenticatedUser.id})
        .then(books=>{
            res.json({books});
        });

});


router.post('/add',(req,res) => {

    const book = req.body.book;
    
    const BooksObj = new Books();

    BooksObj.userId = req.authenticatedUser.id; //get req.authenticatedUser from authenticate middleware
    BooksObj.goodreadsId = book.goodreadsId;
    BooksObj.title = book.title;
    BooksObj.author = book.author;
    BooksObj.cover = book.cover;
    BooksObj.pages = book.pages;
    
    BooksObj.save()
        .then(book=>{

            if(!book)
                return responseErrorGlobal(res,Array(`selected book save invalid`));

        res.json({}).end();   // Book save process OK
            
        });


});


export default router;