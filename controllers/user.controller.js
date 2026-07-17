import User from "../models/user.model.js";
import bcrypt from "bcrypt";
// import { generateToken } from "../utils/generateToken.js";
import { deleteMediaFromCloudinary, uploadOnCLoudinary } from "../utils/cloudinary.js";
import { catchAsync } from "../utils/catchAsync.js";
import { ApiError } from "../utils/ApiError.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { appendFile } from "fs";
import { ApiResponse } from "../utils/ApiResponse.js";

/**
 * generate tokens
 * 
 */

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken

    await user.save({ validateBeforeSave: true })

    return { accessToken, refreshToken }
  } catch (error) {
    console.log("Token error", error)
    throw new ApiError(500,
      "Something went wrong while generating access token"
    );
  }
};




/**
 * Create a new user account
 * @route POST /api/v1/users/signup
 */
export const register = catchAsync(async (req, res) => {

  const { name, email, password, role } = req.body

  const existedUser = await User.findOne(
    { email },
  );

  if (existedUser) {
    throw new ApiError(409, " User with this email or password already exists\n please try to login")
  }


  const user = await User.create({
    name,
    email,
    password,
    role
  });


  const { unHashedToken, HashedToken, tokenExpiry } = user.generateTempToken()

  user.EmailVerificationToken = HashedToken
  user.EmailVerificationExpiry = tokenExpiry


  await user.save({ validateBeforeSave: false })




  await sendEmail({
    email: user.email,
    subject: "Please verify your email",
    mailgenContent: emailVerifificationMailgenContent(
      user.username,
      `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${unHashedToken} `
    ),
  })

  const createdUser = await User.findById(user._id).select(
    "-password  -refreshToken , -accessToken , -emailVerificationToken -emailVerificationExpiry "
  )

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering user")
  }

  return res
    .statsu(201)
    .json(new ApiResponse(
      201, { user: createdUser }, "User created successfully\n verification email has been sent to your email"
    ));

});

/**
 * Authenticate user and get token
 * @route POST /api/v1/users/signin
 */
export const signIn = catchAsync(async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email })

  if (!user) {
    throw new ApiError(404, "user not found with these credientials\n register first to login")
  };

  const isPasswordValid = await user.isPasswordCorrect(password)


  if (!isPasswordValid) {
    throw new ApiError(400, "Wrong password please try again")
  };

  const { accessToken, refreshToken } = user.generateAccessAndRefreshToken(user._id);


  const loggedInUser = await User.findById(user._id).select(
    " -password -emailVerificationExpiry -emailVerificationToken  -refreshToken"
  );




  const options = {
    httpOnly: true,
    secure: true
  };


  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
      new ApiResponse(200, { data: loggedInUser, accessToken, refreshToken }, "User logged-IN Successfully"),
    );

});

/**
 * Refresh token rotation
 * @route api/v1/users/refresh-token
 */


export const refreshToken = catchAsync(async (req, res) => {

  const incommingRefreshToken = req.cookies.refreshToken


  if (!incommingRefreshToken) {
    throw new ApiError(401, error.message)
  };

  let decoded;
  try {
    decoded = jwt.verify(
      incommingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET)
  } catch (error) {
    throw new ApiError(401, "Unauthorized")
  };


  const user = await User.findById(decoded._id)

  if (!user) {
    throw new ApiError(404, "User not found")
  };


  const HashIncommingRefreshToken = crypto
    .createHash('sha256')
    .update(incommingRefreshToken)
    .digest('hex')


  if (user.refreshToken !== HashIncommingRefreshToken) {
    throw new ApiError(401, "Invalid Refresh Token")
  };


  const accessToken = user.generateAccessToken()
  const refreshToken = user.generateRefreshToken()

  const hashedRefreshToken = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex')


  user.refreshToken = hashedRefreshToken

  await user.save({ validateBeforeSave: false })

  const options = {
    httpOnly: true,
    secure: true
  };

  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(new ApiResponse(200,
      { accessToken, refreshToken }
    ));

});

/**
 * Sign out user and clear cookie
 * @route POST /api/v1/users/signout
 */
export const signOut = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: null
      },
    },
    {
      new: true
    }
  )


  const options = {
    httpOnly: true,
    secure: true
  }

  return res
    .status(200)
    .clearcookie('accessToken', accessToken)
    .clearcookie('refreshToken', refreshToken)
    .json(
      new ApiResponse(200, {}, "User logout successfully")
    )
});

/**
 * Get current user profile
 * @route GET /api/v1/users/profile
 */
export const getCurrentUserProfile = catchAsync(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched"))
});

/**
 * Update user profile
 * @route PATCH /api/v1/users/profile
 */
export const updateUserProfile = catchAsync(async (req, res) => {
  const { name, email, bio } = req.body

  const user = await User.findById(user._id)

  if (!user) {
    throw new ApiError(404, "User not found")
  };

  const UpdatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        name: name,
        email: email,
        bio: bio
      },
    },
    {
      new: true
    }
  )

  return res
    .status(200)
    .json(
      new ApiResponse(200, { data: UpdatedUser }, "User Updated successfully")
    )

});

/**
 * Change user password
 * @route PATCH /api/v1/users/password
 */
export const changeUserPassword = catchAsync(async (req, res) => {

  const { oldPassword, newPassword } = req.body

  const user = await User.findById(req.id).select(" +password")

  if (!user) {
    throw new ApiError(404, "User not found ")
  };

  // verify current password
  if (!(await user.comparePassword(oldPassword))) {
    throw new ApiError(401, "Current password is invalid")
  }


  user.password = newPassword;
  await user.save()

  return res
    .status(201)
    .json({
      success: true,
      message: "password updated successfully"
    })
});



/**
 * Request password reset
 * @route POST /api/v1/users/forgot-password
 */
export const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body

  const user = await User.findOne({ email })

  if (!user) {
    throw new ApiError(404, "User with this email not found")
  };

  const resetToken = user.generateTempToken();
  await user.save({ validateBeforeSave: false });


  return res
    .status(200)
    .json({
      sucess: true,
      message: " reset password instruction is sent to your email"
    });
});

/**
 * Reset password
 * @route POST /api/v1/users/reset-password/:token
 */
export const resetPassword = catchAsync(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  // get user by reset token

  const user = await User.findOne({
    resetPasswordToken: crypto.createHash('sha256').update(token).digest('hex'),
    resetPasswordExpire: { $gt: Date.now() },
  })

  if (!user) {
    throw new ApiError(404, "User not found")
  }


  user.password = password
  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined
  await user.save()

  return res
    .status(201)
    .json(new ApiResponse(201, {}, " User password reset successfully"))

});

/**
 * Delete user account
 * @route DELETE /api/v1/users/account
 */
export const deleteUserAccount = catchAsync(async (req, res) => {
  const user = await User.findById(req.id);
  // avatar also have to delete 

  await User.findByIdAndDelete(req.id);

  res.cookie("token", "", { maxAge: 0 });
  res.status(200).json({
    sucess: true,
    message: "Account deleted successfully"
  })
});
