

require('dotenv').config();
const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

const connectDB = async ()=>{

    try{

       const connection = await mongoose.connect( process.env.MONGO_DB_URL, {
        useNewUrlParser : true,           // connect to mongodb link k liye hota h 
        useUnifiedTopology : true,       //stable connection k liye hota h 

       });

       console.log(`DB is Connected .... :)`)

    } catch (error) {
        console.log(`ERROR in DB ${error}`)
    }


}

module.exports = connectDB ;
