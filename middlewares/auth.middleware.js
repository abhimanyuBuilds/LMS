import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { catchAsync } from "../utils/catchAsync.js"

export const verifyJWT = catchAsync(async (req, res, next) => {
    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");


    if (!token) {
        throw new ApiError(401, error.message)
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