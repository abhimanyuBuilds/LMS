import express from "express";
import {
    getUserCourseProgress,
    updateLectureProgress,
    markCourseAsCompleted,
    resetCourseProgress
} from
    "../controllers/courseProgress.controller.js"
import { verifyJWT, restrictTo } from "../middlewares/auth.middleware.js";
import { upload } from "../utils/multer.js";
const router = express.Router();


router.use(verifyJWT) // Every route has to verify the login condition

router
    .route('/:courseId')// tested ✅
    .get(getUserCourseProgress);

router
    .route('/:courseId/lectures/:lectureId')// tested ✅
    .patch(updateLectureProgress);


router
    .route("/:courseId/complete") // tested ✅
    .patch(markCourseAsCompleted)


router
    .route("/:courseId/reset") // tested ✅
    .patch(resetCourseProgress)


export default router