import express from 'express'
import {
    getPurchasedCourses,
    getCoursePurchaseStatus,
    handleStripeWebhook,
    initiateStripeCheckout
} from '../controllers/coursePurchase.controller.js';

import { verifyJWT } from "../middlewares/auth.middleware.js"



const router = express.Router()


router
    .route("/checkout/create-checkout-session")
    .post(verifyJWT, initiateStripeCheckout)

router
    .route("/webhook")
    .post( handleStripeWebhook)

router
    .route("/course/:courseId/detail-with-status")
    .get(verifyJWT, getCoursePurchaseStatus)

router.
    route("/")
    .get(verifyJWT, getPurchasedCourses)



export default router