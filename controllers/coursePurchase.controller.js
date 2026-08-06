import Stripe from "stripe";
import dotenv from "dotenv"
dotenv.config({})
import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { Lecture } from "../models/lecture.model.js";
import User from "../models/user.model.js";
import { catchAsync } from "../utils/catchAsync.js";
import { ApiError } from "../utils/ApiError.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Create a Stripe checkout session for course purchase
 * @route POST /api/v1/payments/create-checkout-session
 */
export const initiateStripeCheckout = catchAsync(async (req, res) => {
  const { courseId } = req.params;

  const course = await Course.findById(courseId);
  if (!course) {
    throw new ApiError(404, "Course not found")
  };

  // create a new course purchase record

  const newPurchase = new CoursePurchase({
    course: courseId,
    user: req.id,
    amount: course.price,
    status: "pending",
    PaymentMethod: "stripe"
  });


  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: course.title,
            images: [],
          },
          unit_amount: course.price * 100 //Amount in pasie
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.CLIENT_URL}/course-progress/${courseId}`,
    cancel_url: `${process.env.CLIENT_URL}/course-detail/${courseId}`,
    metadata: {
      courseId: courseId,
      userId: req.id,
    },
    shipping_address_collection: {
      allowed_countries: ["IN"],
    },
  });


  if (!session.url) {
    throw new ApiError(400, "Failed to create checkout session")
  };

  // save record of new purchase

  newPurchase.paymentId = session.id;
  await newPurchase.save()

  res.status(200).json({
    success: true,
    data: {
      checkoutUrl: session.url,
    },
  });


});

/**
 * Handle Stripe webhook events
 * @route POST /api/v1/payments/webhook
 */
export const handleStripeWebhook = catchAsync(async (req, res) => {
  
}); 

/**
 * Get course details with purchase status
 * @route GET /api/v1/payments/courses/:courseId/purchase-status
 */
export const getCoursePurchaseStatus = catchAsync(async (req, res) => {
  const { courseId } = req.params 

  const course = await Course.findById(courseId)
    .populate('creator', 'name avatar')
    .populate('lectures' , 'lectureTitle videoUrl duration');

  if(!course){
    throw new ApiError( 404 , "Course not found")
  };

  // check if user has purchased the course..

  const course = CoursePurchase.exists({
    user: req.id,
    course: courseId,
    status: 'completed'
  });

  res.status(200)
    .json({
      success: true ,
      data: {
        course, 
        isPurchased: Boolean(purchased)
      },
    });
});

/**
 * Get all purchased courses
 * @route GET /api/v1/payments/purchased-courses
 */
export const getPurchasedCourses = catchAsync(async (req, res) => {
  const purchases = await CoursePurchase.find({
    userId: req.id,
    status: "completed",
  }).populate({
    path: "courseId",
    select: "courseTitle courseThumbnail courseDescription category",
    populate:{
      path: "creator",
      select: "name avatar",
    },
  });

  res.status(200)
    .json({
      success: true ,
      data: purchases.map((purchase) => purchase.courseId),
    });
});
