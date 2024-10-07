import { Schema,mongoose } from 'mongoose';
import bcrypt from 'bcryptjs';
import  jwt from 'jsonwebtoken';
import crypto from'crypto';

const userSchema=new Schema({
    fullName:{
        type:String,
        require:[true,"Name is required"],
        minLength:[3,"name must be 3 characters"],
        lowercase:true,
        maxLength:[50,"name must beless than 50 characters"],
        trim :true,
    },
    email:{
        type:String,
        require:[true,"Email is required"],
        trim :true,
        unique:true,
        lowercase:true,
        match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,"Enter valid Email"],

    },
    password:{
        type:String,
        require:[true,"Password is required"],
        minLength:[8,"Enter at least 8 characters"],
        select :false
    },
    role:{
        type:String,
        enum:['USER','ADMIN'],
        default:'USER',

    },
    avatar:{
        public_id:{
            type:String
        },
        secure_url:{
            type:String
        }

    },
    forgotPasswordToken:String,
    forgotPasswordExpiry:Date
},{timesatmps:true}
);


userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        return next();
    }
    this.password = await bcrypt.hash(this.password,10);
    return next();
})

userSchema.methods={
    comparePassword:async function(plainTextPassword){
        return await bcrypt.compare(plainTextPassword,this.password);

    },
    generateJWTToken:function(){
        return jwt.sign(
            {id:this._id,role:this.role, email:this.email,subscription:this.subscription},
            process.env.JWT_SECRET,
            {expiresIn:process.env.JWT_EXPIRY}
        );
    },
    generatePasswordToken:async function(){
        const resetToken=crypto.randomBytes(20).toString('hex')
        this.forgotPasswordToken=crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        this.forgotPasswordExpiry=Date.now()+ 15*60*1000;
        return resetToken;
    }
}



const User=mongoose.model("User",userSchema);
export default User;