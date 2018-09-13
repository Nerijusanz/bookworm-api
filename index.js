import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import Promise from 'bluebird';//owerite default mongoose promise into bluebird promise

import auth from './routes/auth';

dotenv.config();

const app = express();
app.use(bodyParser.json());

mongoose.Promise = Promise; //owerite default mongoose promise into bluebird promise
mongoose.connect(process.env.MONGODB_URL,{ useNewUrlParser: true });

app.use('/api/auth',auth);

/*app.post('/api/auth',(req,res)=>{
    res.status(400).json({
        errors:{
            global:"invalid credentials"
        }
    });
});*/

app.get('/*',(req,res)=>{
    res.sendFile(path.join(__dirname,'index.html'));
});


app.listen(8080,()=>console.log('running on localhost:8080'));