import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import Promise from 'bluebird';//overwrite default mongoose promise into bluebird promise

import auth from './routes/auth';
import users from './routes/users';

dotenv.config();    //INIT .env PARAMS

const app = express();
//posts parser
app.use(bodyParser.json());

//database setup
mongoose.Promise = Promise; //overwrite default mongoose promise library into bluebird promise library
mongoose.connect(process.env.MONGODB_URL,{ useNewUrlParser: true });
mongoose.set('useCreateIndex', true);

//Router
app.use('/api/auth',auth);
app.use('/api/users',users);

app.get('/*',(req,res)=>{
    res.sendFile(path.join(__dirname,'index.html'));
});


app.listen(8080,()=>console.log('running on localhost:8080'));