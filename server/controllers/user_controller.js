
import cloudinary from 'cloudinary';
import  appError  from "../utils/appErro.js";
import User from '../models/user_model.js';
import fs from "fs/promises";
import app from '../app.js';

const cookieOptions={
    secure: true,
    maxAge: 7*24*60*60*1000,
    httpOnly:true
}

const register=async (req,res,next)=>{
    const {fullName,email,password,role} =req.body;
    if(!fullName||!email||!password){
        return next(new appError('All feilds are required',400));
    }
    const userExists=await User.findOne({email});
    if(userExists){
        return next(new appError('Email already exists',400));

    }
    const user= await User.create({
        fullName,
        email,
        password,
        role: role || 'user',
        avatar:{
            public_id:email,
            secure_url:'https://cdn-icons-png.flaticon.com/512/2815/2815428.png'
        }
    });
    if(!user){
        return next(new appError('User registration failed',400));
    }

    console.log('FileDetails >',JSON.stringify(req.file));
    // todo:uplaod user avatar
    if(req.file){
        try{
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms',
                width: 250,
                height: 300,
                gravity: 'faces',
                crop: 'fill'
            });
            
            if(result){
                user.avatar.public_id=result.public_id;
                user.avatar.secure_url=result.secure_url;
                fs.rm (`uploads/${req.file.filename}`);                
            }
        }catch(e){
            return next(new appError(e.message || 'file upload failed',500));
        }

    }
    await user.save();

    // get jwt token in cookie 

    user.password=undefined;
    res.status(200).json({
        success:true,
        meassage:'Registerdd succesfully',
        user
    })

}
const login=async (req,res)=>{
    const {email,password}=req.body;
    if(!email||!password){
        return next(new appError('All feilds are required',400));
    }
    const user =await User.findOne({
        email
    }).select('+password');

    if(!user || !user.comparePassword(password)){ //todo
        return next(new appError('Email or password do not match',400));
    }
    const token = await user.generateJWTToken();
    user.password=undefined;
    res.cookie('token',token,cookieOptions);

    res.status(200).json({
        success:true,
        message:"user registerd successfully",
        user
    })
}
const logout =(req,res) =>{
    try{       
        res.cookie("token",null,{
            secure:true,
            maxAge:0,
            httpOnly:true
        });
        res.status(200).json({
            success:true,
            message:"LoggedOut",
        })

    }catch(error){
        return res.status(400).json({
            success:false,
            message:e.message,
        })
    }
}
const getProfile=async (req,res)=>{
    const userr =await User.findById(req.user.id);
    res.status(200).json({
        success:true,
        message:"User details",
        userr
    })

}
const forgotPassword=async (req,res,next)=>{
    const {email}=req.body;
    if(!email){
        return next (
            new appError('Email is required',400)
        )
    }
    const user=await User.findOne({email});
    if(!user){
        return next (
            new appError('Email is not registered',400)
        )
    }

    const resetToken=await user.generatePasswordToken();
    await user.save();
    const resetPasswordUrl=`${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const subject="Reset Password";
    const message=`You can reset your password by clicking<a href=${resetPasswordUrl} target='blank' Reset your password</a>\nIf the above link does not work then copy paste this link in new tab ${resetPasswordUrl}.`;

    console.log(resetPasswordUrl);
    try{
        // crate send email method
        await sendEmail(email,subject ,message );
        req.status(200).json({
            success:true,
            message:`Reset password token has been sent to ${email} successfully! `
        });

    }catch(e){
        user.forgotPasswordExpiry=undefined;
        user.forgotPasswordToken=undefined;
        await user.save();
        return next(new appError(e.message,500));
    }
}
const resetPassword=async (req,res,next)=>{
    const {resetToken}=req.params;
    const {password}=req.body;

    const forgotPasswordToken=crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    const user=await User.findOne({
        forgotPasswordToken,
        forgotPasswordExpiry:{$gt:Date.now()}
    });
    if(!user){
        return next(
            new appError('Token is unvaild or expired',400)

        )
    }
    user.password=password;
    user.forgotPasswordExpiry=undefined;
    user.forgotPasswordToken=undefined;

    await user.save();

    req.status(200).json({
        success:true,
        message:'Password changed successfully'
    });

}

const changePassword =  async function(req,res,next){
    const {oldPassword,newPassword}=req.body;
    if(!oldPassword || !newPassword){
        return next(
            new appError('All feilds mandatory',400)
        )
    }
    const user= await User.findById(id).select('+password')
    if(!user){
        return next(
            new appError('User not found ',400)
        )
    }
    const isPasswordValid= await user.comparePassword(password);
    if(!isPasswordValid){
        return next(
            new appError('Wrong old password ',400)
        )
    }
    user.password=password;
    user.save();
    user.password=undefined;
    res.status(200).json({
        success: true,
        message:'Password changed successfully'
    })
}

const updateUser= async function (req,res,next) {
    const {fullName}=req.body;
    const {id}=req.body;
    const user=await User.findById(id);
    if(!user){
        return next(
            new appError('User not found ',400)
        )
    }
    if (fullName){
        user.fullName=fullName;
    }
    if(req.file){
        await cloudinary.v2.uploader.destroy(user.avatar.public_id);
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
            folder: 'lms',
            width: 250,
            height: 300,
            gravity: 'faces',
            crop: 'fill'
        });
        
        if(result){
            user.avatar.public_id=result.public_id;
            user.avatar.secure_url=result.secure_url;
            fs.rm (`uploads/${req.file.filename}`);                
        }
        
    }
    await user.save();

    res.status(200).json({
        success:true,
        message:'Save ho gya'
    })

}

export{
    register,
    login,
    logout,
    getProfile,    
    forgotPassword,
    resetPassword,
    changePassword,
    updateUser,
}