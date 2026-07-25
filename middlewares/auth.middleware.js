import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js"
import { catchAsync } from "../utils/catchAsync.js"
import User from "../models/user.model.js"

export const verifyJWT = catchAsync(async (req, res, next) => {
    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");


    if (!token) {
        throw new ApiError(401, "Access Denied")
    };


    try {
        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodeToken._id).select(
            " -password  -refreshToken  -resetPasswordToken -resetPasswordExpire -EmailVerificationToken -EmailVerificationExpiry -email -enrolledCourses -createdCourse -avatar -bio")

        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        };

        req.user = user
        next()
    } catch (error) {
        console.log("JWT ERROR", error);
        throw new ApiError(401, error.message)
    }
});


export const restrictTo = (...roles) => {
    return catchAsync(async (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new ApiError(403, "You don't have permission to perform this action.")
        };
        next();
    });
};