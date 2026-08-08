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


router.get("/Published", getPublishedCourses);
router.get("/search", searchCourses);





// Course Management Routes 



router
    .route("/")
    .post(restrictTo('Instructor'), upload.single('thumbnail'), createNewCourse)
    .get(restrictTo('Instructor'), getMyCreatedCourses);


// course details and update 


router
    .route('/c/:courseId')
    .get(getCourseDetails)
    .patch(restrictTo('Instructor'), upload.single('thumbnail'), updateCourseDetails);



//Lecture Management


router
    .route("/c/courseId/:leactures")
    .get(getCourseLectures)
    .post(restrictTo('Instructor'), upload.single("video"), addLectureToCourse);




export default router
