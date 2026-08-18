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


/**
 * @swagger
 * /courses/Published:
 *   get:
 *     summary: Get published courses
 *     description: |
 *       Returns a paginated list of all published courses.
 *
 *       Courses are sorted by creation date in descending order,
 *       with the newest courses returned first.
 *
 *       The instructor's `name` and `avatar` fields are populated
 *       in the response.
 *
 *     tags:
 *       - Courses
 *
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         description: Page number for pagination.
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *           example: 1
 *
 *       - in: query
 *         name: limit
 *         required: false
 *         description: Number of courses to return per page.
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *           example: 10
 *
 *     responses:
 *       200:
 *         description: Published courses retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucess:
 *                   type: boolean
 *                   example: true
 *
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 *
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *
 *                     limit:
 *                       type: integer
 *                       example: 10
 *
 *                     total:
 *                       type: integer
 *                       example: 25
 *
 *                     pages:
 *                       type: integer
 *                       example: 3
 *
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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


