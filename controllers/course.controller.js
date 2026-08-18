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
    thumbnail,
    category,
    level,
    price,
    instructor: req.user.id
  })

  if (!course) {
    throw new ApiError(400, "Course is not created")
  };


  await User.findByIdAndUpdate(
    req.user._id, {
    $addToSet: { createdCourse: course._id }
  },
    {
      new: true
    }
  );


  return res
    .status(201)
    .json(new ApiResponse(201, { data: course }, "course created successfully."))


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
      path: "Instructor",
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
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit

  const [courses, total] = await Promise.all([
    Course.find({ isPublished: true })
      .populate({
        path: "instructor",
        select: "name avatar"
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Course.countDocuments({ isPublished: true })
  ]);


  return res
    .status(200)
    .json({
      success: true,
      data: courses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
});


/**
 * Get courses created by the current user
 * @route GET /api/v1/courses/my-courses
 */

export const getMyCreatedCourses = catchAsync(async (req, res) => {
  const courses = await Course.find({ instructor: req.user.id }).populate({
    path: "enrolledStudents",
    select: "name avatar",
  });

  return res
    .status(200)
    .json({
      success: true,
      count: courses.length,
      data: courses,
    });
});


/**
 * Update course details
 * @route PATCH /api/v1/courses/:courseId
 */
export const updateCourseDetails = catchAsync(async (req, res) => {
  const { courseId } = req.params;
  const { title, subtitle, description, category, level, price } = req.body;

  const course = await Course.findById(courseId);
  if (!course) {
    throw new ApiError(404, "Course not found")
  }

  // verify ownerShip 
  console.log(course)
  console.log(req.user.id)
  console.log(course.instructor)

  if (course.instructor.toString() !== req.user.id) {
    throw new ApiError("Not Authorized to update this course")
  };

  //handle thumbnail upload
  let thumbnail;
  if (req.file) {
    if (course.thumbnail) {
      await deleteMediaFromCloudinary(course.thumbnail);
    }

    const result = await uploadOnCLoudinary(req.file.path);
    thumbnail = result?.secure_url || req.file.path;
  };

  const updateCourse = await Course.findByIdAndUpdate(
    courseId,
    {
      title,
      subtitle,
      description,
      category,
      level,
      price,
      ...(thumbnail && { thumbnail }),
    },
    {
      new: true, runValidators: true
    }
  );

  return res
    .status(200)
    .json({
      success: true,
      message: "course updated successfully",
      data: updateCourse
    })
});

/**
 * Get course by ID
 * @route GET /api/v1/courses/:courseId
 */
export const getCourseDetails = catchAsync(async (req, res) => {

  const course = await Course.findById(req.params.courseId)
    .populate({
      path: "instructor",
      select: "name avatar bio"
    })
    .populate({
      path: "lectures",
      select: "title  subtitle description isPreview order"
    });

  if (!course) {
    throw new ApiError(404, "Course not found")
  };

  return res
    .status(200)
    .json({
      success: true,
      data: {
        ...course.toJSON(),
        averageRating: course.averageRating,
      },
    });
});

/**
 * Add lecture to course
 * @route POST /api/v1/courses/:courseId/lectures
 */
export const addLectureToCourse = catchAsync(async (req, res) => {
  const { title, description, isPreview } = req.body;
  const { courseId } = req.params

  const course = await Course.findById(courseId);

  if (!course) {
    throw new ApiError(404, "Corse not found")
  };

  if (course.instructor.toString() !== req.user.id) {
    throw new ApiError(403, "Not Authorized to update this course..")
  };

  if (!req.file) {
    throw new ApiError(400, "Videl file is required")
  };

  // upload to cloudinary

  const result = await uploadOnCLoudinary(req.file.path)
  if (!result) {
    throw new ApiError(400, "Error uploading video")
  };
  console.log("+ order:", course.lectures.length + 1)
  console.log(" - order:", course.lectures.length + 1)

  const lecture = await Lecture.create({
    title,
    description,
    isPreview,
    order: course.lectures.length + 1,
    videoUrl: result?.secure_url || req.file.path,
    publicId: result?.secure_url || req.file.path,
    duration: result?.duration || 0,
  });

  // add lecture to course 

  course.lectures.push(lecture._id);
  await course.save()

  return res
    .status(200)
    .json({
      success: true,
      message: "Leacture added successfully",
      data: lecture,
    });
});

/**
 * Get course lectures
 * @route GET /api/v1/courses/:courseId/lectures
 */
export const getCourseLectures = catchAsync(async (req, res) => {
  const { courseId } = req.params
  const course = await Course.findById(courseId).populate({
    path: "lectures",
    select: "title description videoUrl duration isPreview order",
    options: { sort: { order: 1 } }
  });

  if (!course) {
    throw new ApiError(404, "course not found")
  };

  const isEnrolled = course.enrolledStudents.includes(req.user.id);
  const isInstructor = course.instructor.toString() === req.user.id;

  let lectures = course.lectures;
  if (!isEnrolled && !isInstructor) {
    lectures = lectures.filter((lecture) => lecture.isPreview)
  };

  return res
    .status(200)
    .json({
      sucess: true,
      data: {
        lectures,
        isEnrolled,
        isInstructor
      }
    })
});
