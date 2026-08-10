import { CourseProgress } from "../models/courseProgress.model.js";
import { Course } from "../models/course.model.js";
import { catchAsync } from "../utils/catchAsync.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Get user's progress for a specific course
 * @route GET /api/v1/progress/:courseId ✅
 */
export const getUserCourseProgress = catchAsync(async (req, res) => {
  const { courseId } = req.params;

  const courseDetails = await Course.findById(courseId)
    .populate("lectures")
    .select("courseTitle courseThumbnail lectures");

  if (!courseDetails) {
    throw new ApiError(404, "Course not found")
  };


  const courseProgress = await CourseProgress.findOne({
    course: courseId,
    user: req.user.id,
  }).populate("course");

  if (!courseProgress) {
    return res
      .status(200)
      .json({
        success: true,
        data: {
          courseDetails,
          progress: [],
          isCompleted: false,
          completionPercentage: 0
        },
      });
  }

  // calculate course completion

  const totalLectures = courseDetail.lectures.length;
  const completedLectures = courseProgress.lectureProgress.filter((lp) => lp.isCompleted).length


  const completionPercentage = Math.round(completedLectures / totalLectures) * 100


  res.status(200).json({
    success: true,
    data: {
      courseDetails,
      progress: [],
      isCompleted: false,
      completionPercentage: 0
    },
  })
});

/**
 * Update progress for a specific lecture
 * @route PATCH /api/v1/progress/:courseId/lectures/:lectureId
 */
export const updateLectureProgress = catchAsync(async (req, res) => {
  const { courseId, lectureId } = req.params;

  let courseProgress = await CourseProgress.findOne({
    course: courseId ,
    user: req.user.d
  });

  if(!courseProgress){
    courseProgress = await CourseProgress.create({
      user: req.user.id,
      course: courseId,
      isCompleted: false,
      lectureProgress: []
    });
  }

  const lectureIndex = courseProgress.lectureProgress.findIndex(
    (lecture) => lecture.lecture === lecutreId
  );

  if(lectureIndex !== -1){
    courseProgress.lectureProgress[lectureIndex].isCompleted = true
  }else{
    courseProgress.lectureProgress.push({
      lecture: lectureId,
      isCompleted: true
    });
  }

  // check if course is completed

  const course = await Course.findById(courseId);
  const completedLectures = courseProgress.lectureProgress.filter((lp) => lp.isCompleted).length

  courseProgress.isCompleted = course.lectures.length === completedLectures;

  await courseProgress.save()

  res.status(200).json({
    success: true ,
    message: "Leacture progress updated successfully",
    data:{
      lectureProgress: courseProgress.lectureProgress,
      isCompleted: courseProgress.isCompleted
    }
  })
});

/**
 * Mark entire course as completed
 * @route PATCH /api/v1/progress/:courseId/complete ✅
 */
export const markCourseAsCompleted = catchAsync(async (req, res) => {
  const { courseId } = req.params;

  const courseProgress = await CourseProgress.findOne({
    course: courseId,
    user: req.user.id,
  });

  if (!courseProgress) {
    throw new ApiError(404, "course not found")
  };

  // Mark lecture as isCompleted

  courseProgress.lectureProgress.forEach((progress) => {
    progress.isCompleted = true;
  });

  courseProgress.isCompleted = true

  await courseProgress.save()

  return res
    .status(200)
    .json({
      success: true,
      message: "Course marked as completed",
      data: {
        courseProgress,
      },
    });
});

/**
 * Reset course progress
 * @route PATCH /api/v1/progress/:courseId/reset ✅
 */
export const resetCourseProgress = catchAsync(async (req, res) => {
  const { courseId } = req.params;

  const courseProgress = await CourseProgress.findOne({
    course: courseId,
    user: req.user.id
  });
  // console.log(courseProgress)

  if (!courseProgress) {
    throw new ApiError(404, "course not found")
  };

  // Rest all progress


  courseProgress.lectureProgress.forEach((lp) => {
    lp.isCompleted = false;
  });

  courseProgress.isCompleted = false;

  await courseProgress.save()
  // console.log(courseProgress)

  res.status(200)
    .json({
      success: true,
      message: "Course progress reset successfully",
      data: courseProgress
    })
});
