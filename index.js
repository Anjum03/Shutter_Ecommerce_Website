
require('dotenv').config();

const app = require("express")();

const PORT = process.env.PORT || 1000 ;

//connecting DB
const connectDb = require('./DB/connection');
connectDb();

//morgan
const morgan = require('morgan')
app.use(morgan('combined'));

//cors using
const cors = require('cors');
app.use(cors());

//using body-parser
const bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}))


//routing
const adminRouting = require('./Routes/adminRoute');
app.use('/', adminRouting);

const userRouting = require('./Routes/userRoute');
app.use('/', userRouting)

const cartRouting = require('./Routes/cartRoute');
app.use('/', cartRouting)

const bannerRouting = require('./Routes/bannerRoute');
app.use('/', bannerRouting)

const productRouting = require('./Routes/productRoute');
app.use('/', productRouting)

//server started.....
app.listen(PORT, ()=>{
    console.log(`Server is Started on ${PORT}`)
})
