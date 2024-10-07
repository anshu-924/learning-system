import cookieParser from 'cookie-parser' ;

import express from 'express';
import cors from 'cors';
import userRoutes from "./routes/user_routes.js"
import errorMiddleware from './middleware/error_middleware.js'
import morgan from 'morgan';
import courseRoutes from './routes/course.routes.js';


const app=express();
app.use(express.json())
app.use(cors({
    origin:[process.env.FRONTEND_URL],
    credentials:true,
}));
app.use(morgan('dev'));
app.use(cookieParser());
app.use('/ping', (req,res)=>{
    res.send('Pong');
});
// 3 route config
app.use('/api/v1/user',userRoutes);
app.use('/api/v1/courses',courseRoutes);
app.all("*",(req,res)=>{
    res.status(404).send("OOPS! Page not found");
});
app.use(errorMiddleware);

export default app;