const express = require('express')
const {PORT}=require('./config/index')
const cookieParser = require('cookie-parser');

const path = require('path');
const connectDB = require('./datbase/index');
const cors =require("cors")
const userRoutes = require('./routes/userRoutes');
const app = express()

app.use(cors({
    origin: 'http://localhost:3000', // Replace with your React app's URL
    credentials: true, // Allows cookies to be sent and received
  }));
 
app.use(express.json());
app.use(cookieParser());
app.use('/api', userRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
connectDB();


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})