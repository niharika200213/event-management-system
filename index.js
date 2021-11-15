const express=require('express');
const app=express();
const cors=require('cors');
const mongoose=require('mongoose');
require('dotenv/config');
const path = require('path');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/eventposts');
const adminRoutes = require('./routes/admin');

app.use(express.json());

app.use(express.urlencoded({extended:true}));

app.use(cors({
  origin: "*",
  methods: ['GET','POST','PUT','DELETE']
}));
app.use('/auth',authRoutes);
app.use('/post',postRoutes);
app.use('/admin',adminRoutes);
app.get('/', function (req,res){res.json({name:"prakhar", age:"19"})});
app.use(express.static(path.join(__dirname,'images')));

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(
    process.env.MONGOOSE_URI,
    {useNewUrlParser: true, useUnifiedTopology: true} 
  )
  .then(result => {
    console.log('connection established');
    app.listen(process.env.PORT||3000);
  })
  .catch(err => console.log(err));



