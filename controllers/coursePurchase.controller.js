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
 * @route POST /api/v1/payments/webhook❌
 */
export const handleStripeWebhook = catchAsync(async (req, res) => {
  
  console.log("========== STRIPE WEBHOOK ==========");
  console.log("Content-Type:", req.headers["content-type"]);
  console.log("Content-Length:", req.headers["content-length"]);
  console.log("Body:", req.body);
  console.log("Is Buffer:", Buffer.isBuffer(req.body));
  console.log("Signature:", req.headers["stripe-signature"]);
  console.log("====================================");

  let event
  try {
    const payloadString = JSON.stringify(req.body, null, 2);
    const secret = process.env.STRIPE_WEBHOOKS_SECRET;

  const header = stripe.webhooks.generateTestHeaderString({
    payload: payloadString,
    secret,
  });


  event = stripe.webhooks.constructEvent(payloadString , header , secret)
  } catch (error) {
    console.error("Stripe webhook error: ", error)
    throw new ApiError(400, error.message )
  }



  if(event.type === "checkout.session.completed"){
    const session  = event.data.object;

    // finding and update purchased course


    const purchase = await CoursePurchase.findOne({
      paymentId: session.id,
    }).populate('course');

    if(!purchase){
      throw new ApiError(404 , "Purchase record not found.")
    };

    //update purchase details

    purchase.amount = session.amount_total
      ? session.amount_total / 100
      : purchase.amount;
    purchase.status = 'completed'
    await purchase.save()

    // make all lecture accessable 

    if(purchase.course?.lectures?.length > 0 ){
      await Lecture.updateMany(
        {_id: {$in : purchase.course.length}},
        {$set: {isPreviewFree: true}}
      )
    }

  }
});

/**
 * Get course details with purchase status
 * @route GET /api/v1/payments/courses/:courseId/purchase-status
 */
export const getCoursePurchaseStatus = catchAsync(async (req, res) => {
  const { courseId } = req.params

  const course = await Course.findById(courseId)
    .populate('instructor', 'name avatar')
    .populate('lectures', 'lectureTitle videoUrl duration');

  if (!course) {
    throw new ApiError(404, "Course not found")
  };

  // check if user has purchased the course..

  const CoursePurchased = await CoursePurchase.exists({
    user: req.user.id,
    course: courseId,
    status: 'completed'
  });

  res.status(200)
    .json({
      success: true,
      data: {
        CoursePurchased,
        isPurchased: Boolean(CoursePurchased)
      },
    });
});

/**
 * Get all purchased courses
 * @route GET /api/v1/payments/purchased-courses
 */
export const getPurchasedCourses = catchAsync(async (req, res) => {
  const purchases = await CoursePurchase.find({
    user: req.user._id,
    status: "completed",
  }).populate({
    path: "course",
    select: "courseTitle courseThumbnail courseDescription category",
    populate: {
      path: "instructor",
      select: "name avatar",
    },
  });

  res.status(200)
    .json({
      success: true,
      data: purchases.map((purchase) => purchase.course),
    });
});
