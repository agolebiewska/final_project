const express = require('express');
const app = express();
const path = require('path');
const port = 3000;
// const Calendar = require('tui-calendar');

// MongoDB
const MongoClient = require('mongodb').MongoClient;
const databaseName = 'project';
const collectionName = 'users';
const mongodbURL = 'mongodb://localhost:27017';
const bodyParser = require('body-parser');

const session = require('express-session');

app.use(session({
  secret: 'javascript session',
  resave: true,
  saveUninitializeed: false
}));

const bcrypt = require('bcrypt');

app.set('view engine', 'pug');

app.get('/', (request, response) => {
  const authenticated = request.session.authenticated || false;
  response.render('index', { user: {authenticated: authenticated} });
});

app.get('/signup', (request, response) => {
  const content = {
    title: 'Signup',
    mainTitle: 'Please signup to application'
  };
  response.render('signup', content);
});

//przesłanie danych do DB z formularza  
app.use(bodyParser.urlencoded({extended: false}));

// app.post('/post-feedback', (request, response) => {
//   mongodbURL.then(function(db) {
//     delete request.body,_id;
//     db.collection('users').insertOne(request.body);
//     // db.collectionName.insertOne({ "name": request.body.name, "email": request.body.email, "password": request.body.password })
//   });
//   response.send('Data recived:\n' + JSON.stringify(request.body));
// });

// app.get('/view-feedbacks', (request, response) => {
//   mongodbURL.then(function(db) {
//     db.collection('users').find({}).toArray().then(function(feedbacks) { 
//     });
//     response.status(200).jason(feedbacks);
//   });
// });

app.use(express.static(path.resolve(__dirname,'public')));

app.post('/signup', (request, response) => {
  const password = bcrypt.hashSync(request.body.password, 10);

  const user = {
    name: request.body.name,
    email: request.body.email,
    password: password
  }

  MongoClient.connect(mongodbURL, (error, client) => {
    const database = client.db(databaseName);
    const collection = database.collection(collectionName);

    // collection.insertOne(user, (error, result) => {
    //   response.redirect('/');
    collection.insertOne(user, (error, result) => {
      response.redirect('/');
    });
  });
});

app.get('/signup', (request, response) => {
  MongoClient.connect(url, function(err, client) {
    const db = client.db('project');
    const collection = db.collection('users');
    
    collection.find({}).toArray((error, document) => {
      client.close();
      response.render('signup', {documents: documents});
    });
  });
});

app.get('/login', (request, response) => {
  const content = {
    title: 'LogIn',
    mainTitle: 'LogIn to your account'
  }; 
  
  response.render('login', content);
}); 

app.post('/login', (request, response) => {
  const email = request.body.email;
  const password = request.body.password;

  // check if user exist in DB
  MongoClient.connect(mongodbURL, (error, client) => {
    const database = client.db(databaseName);
    const collection = database.collection(collectionName);

    collection.find({email: email}).toArray((error, result) => {
      if (result.length === 0) {
        response.render('login', {error: true})
      } else {
        const user = result[0];
        if (user.password === password) {
          request.session.authenticated = true;
          response.redirect('/calendar');
        } else {
          response.render('login', {error: true})
        }
      }
    });
  });
});

app.get('/logout', (request, response, next) => {
  if (request.session) {
    request.session.destroy((error) => {
      if (error) {
        return next(error);
      } else {
        return response.redirect('/');
      }
    });
  }
});

app.get('/create_user', (request, response) => {
  const content = {
    title: 'Create User',
    mainTitle: 'Create User Profile',
    h1: 'Create User'

  };
    
  response.render('create_user', content);
});
//konieczne gdy następowała rejestracja usera
app.post('/create_user', (request, response) => {
  response.render('create_user');
});

app.get('/calendar', (request, response) => {
  const content ={
    title: 'Calendar',
    mainTitle: 'Calendar page'
  };

  response.render('calendar', content);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});