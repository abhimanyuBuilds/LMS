import dotenv from "dotenv"
dotenv.config()
import Razorpay from "razorpay";
import crypto from "crypto";
import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { ApiError } from "../utils/ApiError.js";
import API from "razorpay/dist/types/api.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});



export const createRazorpayOrder = async (req, res) => {
  try {
    const userId = req.id;
    const { courseId } = req.body;

   


    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, "Course not found..")
    };


    // Now create a new purchase course after validate that course is their........

    const newCoursePurchase = new CoursePurchase({
      course: courseId,
      user: userId,
      amount: course.price,
      status: "pending",
      paymentMethod: "razorpay",
    });


    // create razorpay order

    const options = {
      amount: course.price * 100, //in paise
      currency: "INR",
      receipt: `course_${courseId}_${userId}_${Date.now()}`,
      notes: {
        courseId: courseId.toString(),
        userId: userId.toString(),
      },
    };


    const order = await razorpay.orders.create(options);

// storing razorpay order id
    newCoursePurchase.paymentId = order.id;
    // saving the purchase
    await newCoursePurchase.save();


    res.status(200).json({
      success: true,
      orders,
      course: {
        name: course.title,
        description: course.description,
        image: course.thumbnail,
      }
    });
  } catch (error) {
    console.error("Error creating RazorPay order.", error);
    res
      .status(500)
      .json({
        message: "Error while creating Payment ", error: error.message
      });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;


    // verify payment signature

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;


    if (!isAuthentic) {
      throw new ApiError(404, "Payment verification failed..")
    };

    const purchase = await CoursePurchase.findOne({
      paymentId: razorpay_order_id
    });

    if (!purchase) {
      throw new ApiError(404, "Purchase record not found")
    };

    purchase.status = "completed";
    await purchase.save();


    res.status(200)
      .json({
        success: true,
        message: "Payment verified Successfully.",
        courseId: purchase.courseId
      });
  } catch (error) {
    console.error("Error verifying payment", error);
    res
      .status(500)
      .json({
        message: "Error while verifying payment ",
        error: error.message
      });
  }

};
