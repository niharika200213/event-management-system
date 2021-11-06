const express=require('express');
const app=express();
const cors=require('cors');
const mongoose=require('mongoose');
require('dotenv/config');

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/eventposts');
const isAuth = require('./middleware/is-auth');

app.use(express.json());

app.use(express.urlencoded({extended:true}));

app.use(cors({
  origin: "*",
  methods: ['GET','POST','PUT','DELETE']
}));

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

app.use(express.static(__dirname + 'images'));

mongoose
  .connect(
    process.env.MONGOOSE_URI,
    {useNewUrlParser: true, useUnifiedTopology: true} 
  )
  .then(result => {
    console.log('connection established');
    app.listen(8080);
  })
  .catch(err => console.log(err));


app.use('/auth',authRoutes);
app.use('/post',postRoutes);
app.get('/', function (req,res){res.json({name:"prakhar", age:"19"})});
