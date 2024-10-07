import express from 'express';
import upload from '../middleware/multer_middleware.js';
const router =express.Router();
import {isLoggedIn} from '../middleware/auth_middleware.js';
import  {
    register,
    login,
    logout,
    getProfile,
    forgotPassword,
    resetPassword,
    changePassword,
    updateUser,
} from '../controllers/user_controller.js';

router.post('/register',upload.single('avatar'),register);
router.post('/login',login);
router.get('/logout',logout);
router.get ('/me',isLoggedIn,getProfile);
router.post('/reset',forgotPassword);
router.post('/reset/:resetToken',resetPassword);
router.post('/change-password',isLoggedIn,changePassword)
router.put('/update',isLoggedIn,upload.single('avatar'),updateUser)
export default router;