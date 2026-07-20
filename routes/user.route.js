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
    deleteUserAccount
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../utils/multer.js";
import {
    validateSignUp,
    validateSignIn,
    validatePasswordChanged,
    paginationSchema
} from "../validation/auth.validation.js"

import { validate } from "../middlewares/validation.middleware.js"
const router = express.Router()





// Auth route
router.post("/signUp", validate(validateSignUp), register)
router.post("/singIn", validate(validateSignIn), signIn)
router.post("/signOut", signOut)


// Profile router

router.get("/profile", verifyJWT, getCurrentUserProfile);
router.patch("/profile",
    verifyJWT,
    upload.single("avatar"),
    updateUserProfile)


// password management

router.patch("/change-password", 
    validate(validatePasswordChanged)         ,
    verifyJWT,
    changeUserPassword
);


// Account management

router.delete("/account",
    verifyJWT,
    deleteUserAccount
);

export default router

