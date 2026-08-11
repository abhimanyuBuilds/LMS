import dotenv from "dotenv"
dotenv.config()
import Razorpay from "razorpay";
import crypto from "crypto";
import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { PurchasedCourseMailgenContent, sendEmail } from "../services/sendMail.js"
import { ApiError } from "../utils/ApiError.js";
import { logPayments } from "../services/payment.logger.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});



export const createRazorpayOrder = async (req, res) => {
  try {
    const userId = req.user.id;
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
      currency: "INR",
      status: "pending",
      paymentMethod: "razorpay",
    });

    // create razorpay order

    const options = {
      amount: course.price * 100, //in paise
      currency: "INR",
      receipt: `course_${courseId}-${Date.now()}`,
      notes: {
        courseId: courseId,
        userId: userId,
      },
    };

    const order = await razorpay.orders.create(options);

    logPayments({
      userId: req.user.id,
      courseId: course.courseId,
      orderId: order.id,
      paymentId: null,
      amount: course.price,
      currency: "INR",
      status: "pending",
      verificationTime: Date.now(),
      failureReason: null
    });

    // storing razorpay order id
    newCoursePurchase.paymentId = order.id;
    // saving the purchase
    await newCoursePurchase.save();


    res.status(200).json({
      success: true,
      order,
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


    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      throw new ApiError(
        400,
        "razorpay_order_id, razorpay_payment_id and razorpay_signature are required"
      );

    }
    // verify payment signature



    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');



    const isAuthentic = expectedSignature === razorpay_signature;


    if (!isAuthentic) {

      logPayments({
        userId: req.user.id,
        courseId: null,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        amount: null,
        currency: "INR",
        status: "failed",
        verificationTime: new Date.now().toISOString(),
        failureReason: "Invalid RazorPay signature"
      });

      throw new ApiError(400,
        "Payment verification failed.."
      );

    }


    /**Debug
      console.log("========== RAZORPAY VERIFY ==========");
    console.log("Order ID:", razorpay_order_id);
    console.log("Payment ID:", razorpay_payment_id);
    console.log("Received Signature:", razorpay_signature);
    console.log("Expected Signature:", expectedSignature);
    console.log("Secret exists:", !!process.env.RAZORPAY_KEY_SECRET);
    console.log("======================================");
    */

    const purchase = await CoursePurchase.findOne({
      paymentId: razorpay_order_id
    });


    if (!purchase) {

      logPayments({
        userId: req.user.id,
        courseId: null,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        amount: null,
        currency: "INR",
        status: "failed",
        verificationTime: Date.now(),
        failureReason: "Purchase record not found"
      });
      throw new ApiError(404,
        "Purchase record not found"
      )
    };

    purchase.status = "completed";
    await purchase.save();



    logPayments({
      userId: purchase.user,
      courseId: purchase.courseId,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      amount: purchase.price,
      currency: purchase.currency,
      status: "completed",
      verificationTime: Date.now(),
      failureReason: null
    });


    if (purchase.status === "completed") {

      try {
        await sendEmail({
          email: req.user.email,
          subject: "You’re in! Start your course today",
          mailgenContent: PurchasedCourseMailgenContent(
            req.user.name,

          )
        });
        // debug
        console.log("REQ.email:", req.user.email)
        console.log("Mail sent successfully.🎊")

      }
      catch (error) {
        console.log("Mail failed to send ")
        console.error("error", error)
        throw error
      }
      res.status(200)
        .json({
          success: true,
          message: "Payment verified Successfully.",
          courseId: purchase.course
        });
    };
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