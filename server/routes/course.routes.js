import { Router } from 'express';
import {getAllCourses,getLecturesByCourseId,createCourse,deleteCourse,updateCourse,addLecturesToCourseById,deleteLecturesFromCourseById} from "../controllers/course.controller.js"
import { isLoggedIn ,authorisedRoles} from '../middleware/auth_middleware.js';
import {upload} from '../middleware/multer_middleware.js'
const router=Router();

router
    .route('/')
    .get(getAllCourses)
    .post(
        isLoggedIn,
        authorisedRoles('ADMIN'),
        upload.single('thumbnail'),
        createCourse)
    .delete(isLoggedIn, authorisedRoles('ADMIN'),deleteLecturesFromCourseById);

router
    .route('/:id')
    .get(
        isLoggedIn,
        getLecturesByCourseId)
    .put(isLoggedIn,authorisedRoles('ADMIN'),updateCourse)
    .delete(isLoggedIn,authorisedRoles('ADMIN'),deleteCourse)
    .post(isLoggedIn,authorisedRoles('ADMIN'),upload.single('lecture'),addLecturesToCourseById);

export default router;