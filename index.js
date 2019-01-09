import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import Promise from 'bluebird'; // overwrite default mongoose promise into bluebird promise

import auth from './routes/auth';
import dashboard from './routes/dashboard';
import book from './routes/book';
import booksApi from './routes/booksApi';

dotenv.config(); // INITIALIZE .env PARAMS

const app = express();
// bodyParser middleware
app.use(bodyParser.json());

// -------------MongoDB setups-------------
mongoose.Promise = Promise; // overwrite default mongoose promise library into bluebird promise library
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true })
  .then(() => console.log('MongoDB Connected successfully'))
  .catch(err => console.log(err));
mongoose.set('useCreateIndex', true);

// -----------------------------------------

// ----------------Routers------------------
app.use('/api/auth', auth);
app.use('/api/dashboard', dashboard);
app.use('/api/books', book);
app.use('/api/books_api', booksApi);
// -----------------------------------------


if (process.env.NODE_ENV === 'production') {
// set static path to react production build folder
  app.use(express.static('../bookworm-react/build'));

  app.get('/*', (req, res) => {
  // load react  build index file
    res.sendFile(path.join(__dirname, '..', 'bookworm-react', 'build', 'index.html'));
  });
} else {
  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });
}


const PORT = process.env.LISTEN_PORT || 5000;

app.listen(PORT, () => console.log(`server running on localhost:${PORT}`));