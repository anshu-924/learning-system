import mongoose from 'mongoose';

mongoose.set('strictQuery',false);

const connectToDB=async()=>{
    try{
        const{connection}=await mongoose.connect(
            process.env.MONGO_URL || `mongodb://localhost:27017/lms`
        );
        if(connection){
            console.log(`connection to mongodb ${connection.host}`)
        }
    }catch(e){
        console.log(e);
        process.exit(1);
    }
}

export default connectToDB;