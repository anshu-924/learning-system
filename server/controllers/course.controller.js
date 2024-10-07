import Course from "../models/course.model.js";
import appError from "../utils/appErro.js";
import fs from "fs/promises";
import cloudinary from "cloudinary";

import path from 'path';

export const getAllCourses = async function (req, res, next) {
  try {
    const courses = await Course.find({}).select("-lectures");
    res.status(200).json({
      success: true,
      message: "all courses",
      courses,
    });
  } catch (e) {
    return next(new appError(e.message, 500));
  }
};

export const getLecturesByCourseId = async function (req, res, next) {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) {
      return next(new appError("Invalid course id ", 400));
    }
    res.status(200).json({
      success: true,
      message: "Course exists ",
      lectures: course.lectures,
    });
  } catch (e) {
    return next(new appError(e.message, 500));
  }
};

export const createCourse = async function (req, res, next) {
  try {
    const { title, description, category, createdBy } = req.body;

    if (!title || !description || !category || !createdBy) {
      return next(new appError("All fields are required", 400));
    }
    const course = await Course.create({
      title,
      description,
      category,
      createdBy,
      thumbnail: {
        public_id: "DUMMY",
        secure_url: "DUMMY",
      },
    });
    if (req.file) {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lms",
      });

      if (result) {
        course.thumbnail.public_id = result.public_id;
        course.thumbnail.secure_url = result.secure_url;
      }
      fs.rm(`uploads/${req.file.filename}`);
    }
    await course.save();
    res.status(200).json({
      success: true,
      message: "Course created succesfully ",
      course,
    });
  } catch (e) {
    return next(new appError(e.message, 400));
  }
};

export const updateCourse = async function (req, res, next) {
  try {
    const { id } = req.params;
    const course = await Course.findByIdAndUpdate(
      id,
      {
        $set: req.body, 
      },
      {
        runValidators: true, 
      }
    );

    if (!course) {
      return next(new appError("Invalid course id or course not found.", 400));
    }


    res.status(200).json({
      success: true,
      message: "Course updated successfully",
    });
  } catch (e) {
    return next(new appError(e.message, 400));
  }
};

export const deleteCourse = async function (req, res, next) {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) {
      return next(new appError('Course with given id does not exist.', 404));
    }
    await Course.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (e) {
    return next(new appError(e.message, 500));
  }
};


export const addLecturesToCourseById= async function(req,res,next){
  try{
    const { title, description } = req.body;
    const { id } = req.params;
  
    let lectureData = {};
  
    if (!title || !description) {
      return next(new appError('Title and Description are required', 400));
    }
  
    const course = await Course.findById(id);
  
    if (!course) {
      return next(new appError('Invalid course id or course not found.', 400));
    }
    if (req.file) {
      try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: 'lms', 
          resource_type: 'video'
        });

        if (result) {
          // Set the public_id and secure_url in array
          lectureData.public_id = result.public_id;
          lectureData.secure_url = result.secure_url;
        }
  
        
        fs.rm(`uploads/${req.file.filename}`);
      } catch (error) {

        for (const file of await fs.readdir('uploads/')) {
          await fs.unlink(path.join('uploads/', file));
        }
        return next(
          new appError(
            JSON.stringify(error) || 'File not uploaded, please try again',
            400
          )
        );
      }
    }
  
    course.lectures.push({
      title,
      description,
      lecture: lectureData,
    });
  
    course.numberOfLectures = course.lectures.length;
  
    // Save the course object
    await course.save();
  
    res.status(200).json({
      success: true,
      message: 'Course lecture added successfully',
      course,
    });
  }
  catch(e){
    return next(new appError(e.message, 500));
  }
}


export const deleteLecturesFromCourseById= async function(req,res,next){
  try{
    const { courseId, lectureId } = req.query;

    if (!courseId) {
      return next(new appError('Course ID is required', 400));
    }
  
    if (!lectureId) {
      return next(new appError('Lecture ID is required', 400));
    }
    const course = await Course.findById(courseId);
  
    if (!course) {
      return next(new appError('Invalid ID or Course does not exist.', 404));
    }
    const lectureIndex = course.lectures.findIndex(
      (lecture) => lecture._id.toString() === lectureId.toString()
    );
    if (lectureIndex === -1) {
      return next(new appError('Lecture does not exist.', 404));
    }
    await cloudinary.v2.uploader.destroy(
      course.lectures[lectureIndex].lecture.public_id,
      {
        resource_type: 'video',
      }
    );
    course.lectures.splice(lectureIndex, 1);
    course.numberOfLectures = course.lectures.length;
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Course lecture removed successfully',
    });
  }
  catch(e){
    return next(new appError(e.message, 500));
  }
}