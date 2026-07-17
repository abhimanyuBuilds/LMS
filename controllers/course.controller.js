import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import User from "../models/user.model.js";
import { deleteMediaFromCloudinary, uploadOnCLoudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { catchAsync } from "../utils/catchAsync.js"

/**
 * Create a new course
 * @route POST /api/v1/courses
 */
export const createNewCourse = catchAsync(async (req, res) => {
  const { title, subtitle, description, category, level, price } = req.body

  let thumbnail
  if (req.file) {
    const result = await uploadOnCLoudinary(req.file.path)

    if (!result) {
      throw new ApiError(500, "Thumbnail uploaded failed")
    }

    thumbnail = result?.secure_url || req.file.path;
  } else {
    throw new ApiError(400, "Course thumbnail is required")
  }


  const course = await Course.create({
    title,
    subtitle,
    description,
    category,
    level,
    price,
    instructor: req.id
  })

  if (!course) {
    throw new ApiError(400, "Course is not created")
  };


  await User.findByIdAndUpdate(
    req.id, {
    $addToSet: { createdCourse: course._id }
  },
    {
      new: true
    }
  );


  return res
    .status(201)
    .json(new ApiResonse(201, { data: course }, "course created successfully."))


});

/**
 * Search courses with filters
 * @route GET /api/v1/courses/search
 */


export const searchCourses = catchAsync(async (req, res) => {
  const { search = "", categories = [], level, priceRange, sortBy = "newest" } = req.query

  // create search query

  const searchCriteria = {
    isPublished: true,
    $or: [
      { title: { $regex: search, $options: 'i' } },
      { subtitle: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ],
  };


  // Apply Filter


  if (categories.length > 0) {
    searchCriteria.category = { $in: categories };
  }

  if (level) {
    searchCriteria.level = level;
  }

  if (priceRange) {
    const [min, max] = priceRange.split("-");
    searchCriteria.category = { $gte: min || 0, $lte: max || Infinity };
  }


  // define sorting
  const sortOptions = {};
  switch (sortBy) {
    case "price-low":
      sortOptions.price = 1
      break;
    case "price-high":
      sortOptions.price = -1
      break;
    case "oldest":
      sortOptions.createdAt = 1
      break;
    default:
      sortOptions.createdAt = -1
  }

  const courses = await Course.find(searchCriteria)
    .populate({
      path: "instructor",
      select: " name avatar "
    })
    .sort(sortOptions)

  return res
    .status(200)
    .json({
      success: true,
      data: courses,
      count: courses.length
    });


});

/**
 * Get all published courses
 * @route GET /api/v1/courses/published
 */
export const getPublishedCourses = catchAsync(async (req, res) => {
  // TODO: Implement get published courses functionality
});

/**
 * Get courses created by the current user
 * @route GET /api/v1/courses/my-courses
 */
export const getMyCreatedCourses = catchAsync(async (req, res) => {
  // TODO: Implement get my created courses functionality
});

/**
 * Update course details
 * @route PATCH /api/v1/courses/:courseId
 */
export const updateCourseDetails = catchAsync(async (req, res) => {
  // TODO: Implement update course details functionality
});

/**
 * Get course by ID
 * @route GET /api/v1/courses/:courseId
 */
export const getCourseDetails = catchAsync(async (req, res) => {
  // TODO: Implement get course details functionality
});

/**
 * Add lecture to course
 * @route POST /api/v1/courses/:courseId/lectures
 */
export const addLectureToCourse = catchAsync(async (req, res) => {
  // TODO: Implement add lecture to course functionality
});

/**
 * Get course lectures
 * @route GET /api/v1/courses/:courseId/lectures
 */
export const getCourseLectures = catchAsync(async (req, res) => {
  // TODO: Implement get course lectures functionality
});
