import express from "express";
import {
    generateAccessAndRefreshToken,
    register,
    signIn,
    refreshTokenRotation,
    signOut,
    getCurrentUserProfile,
    updateUserProfile,
    changeUserPassword,
    forgotPassword,
    resetPassword,
    deleteUserAccount,
    userEmailVerification,
    resendEmailVerification
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../utils/multer.js";
import {
    validateSignUp,
    validateSignIn,
    validatePasswordChanged,
    paginationSchema
} from "../validation/auth.validation.js"
import {
    signUpRateLimit, signInRateLimit,
    signOutRateLimit, getCurrentUserRateLimit,
    updateUserProfileRateLimit, changeUserPasswordRateLimit,
    forgotPasswordRateLimit, resetPasswordRateLimit, deleteUserAccountRateLimit, resendMailVerficicationRateLimit
} from "../middlewares/Auth.rateLimmter.middleware.js"
import { validate } from "../middlewares/validation.middleware.js"
const router = express.Router()





// Auth route
router.post("/signUp", validate(validateSignUp), signUpRateLimit, register) // Tested
router.post("/singIn", validate(validateSignIn), signInRateLimit, signIn) // Tested
router.post("/signOut", verifyJWT, signOutRateLimit, signOut) // Tested
router.post("/verify-email/:verificationToken", userEmailVerification) // Tested
router.post("/Resend-verifyEmail", verifyJWT, resendEmailVerification , resendMailVerficicationRateLimit) // Tested


// Profile router

router.get("/profile", verifyJWT, getCurrentUserProfile); // Tested
router.patch("/profile",
    verifyJWT,
    upload.single("avatar"),
    updateUserProfile) // Tested



router.post("/refresh-token",
    refreshTokenRotation)  // tested



// password management

router.patch("/change-password",
    validate(validatePasswordChanged),
    verifyJWT,
    changeUserPassword
); // tested

router.post("/forgot-password", verifyJWT , forgotPassword) // tested

router.post("/reset-password/:passwordResetUrl", verifyJWT , resetPassword) // tested

// Account management

router.delete("/account",
    verifyJWT,
    deleteUserAccount
);


export default router

