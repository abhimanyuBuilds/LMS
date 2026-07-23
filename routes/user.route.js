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


// password management

router.patch("/change-password",
    validate(validatePasswordChanged),
    verifyJWT,
    changeUserPassword
);

router.post("/forgot-password", verifyJWT , forgotPassword)

router.post("/reset-password/:passwordResetUrl", verifyJWT , resetPassword)

// Account management

router.delete("/account",
    verifyJWT,
    deleteUserAccount
);


router.post("/refresh-token",
    refreshTokenRotation)

export default router

