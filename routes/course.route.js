import {
    getMyCreatedCourses, getPublishedCourses, searchCourses, createNewCourse,
    updateCourseDetails, getCourseDetails, addLectureToCourse,
    getCourseLectures
} from "../controllers/course.controller.js";

import {
    verifyJWT, restrictTo
} from "../middlewares/auth.middleware.js"
import { upload } from "../utils/multer.js"
import express from "express";


const router = express.Router()
//Applying middleware to all routes---
router.use(verifyJWT);




// Get published courses


router.get("/Published", getPublishedCourses); // tested ✅
router.get("/search", searchCourses); // tested ✅





// Course Management Routes 



router
    .route("/")
    .post(restrictTo('Instructor'), upload.single('thumbnail'), createNewCourse) // ✅
    .get(restrictTo('Instructor'), getMyCreatedCourses);  // Tested ✅


// course details and update 


router
    .route('/c/:courseId') 
    .get(getCourseDetails) // tested ✅
    .patch(restrictTo('Instructor'), upload.single('thumbnail'), updateCourseDetails); // Tested✅ 



//Lecture Management


router
    .route("/c/:courseId/lectures")
    .get(getCourseLectures) // Tested ✅
    .post(restrictTo('Instructor'), upload.single("video"), addLectureToCourse);  // tested ✅




export default router
