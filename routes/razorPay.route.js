import express from "express";
import  {createRazorpayOrder , verifyPayment}  from "../controllers/razorpay.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"



const router = express.Router();

router.use(verifyJWT) // applied to all 

router
    .route("/create-order")
    .post(createRazorpayOrder)

router
    .route("/verify-Payment")
    .post(verifyPayment)



export default router;