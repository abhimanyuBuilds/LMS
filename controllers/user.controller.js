import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { deleteMediaFromCloudinary, uploadOnCLoudinary } from "../utils/cloudinary.js";
import { emailVerificationMailgenContent, forgotPasswordMailgenContent, sendEmail } from "../services/sendMail.js"
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

export const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()


    const hashRefreshToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest('hex')

    user.refreshToken = hashRefreshToken

    //debug
    // console.log(refreshToken)

    await user.save({ validateBeforeSave: false })

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
 * @route POST /api/v1/user/signup
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


  try {
    await sendEmail({
      email: user.email,
      subject: "Please verify your email",
      mailgenContent: emailVerificationMailgenContent(
        user.name,
        `${req.protocol}://${req.get('host')}/api/v1/user/verify-email/${unHashedToken} `
      ),
    });
    console.log("Mail has been sent successfully...")
  } catch (error) {
    console.log(error)
  }

  const createdUser = await User.findById(user._id).select(
    "-password  -refreshToken  -accessToken  -emailVerificationToken -emailVerificationExpiry -email -createdCourses -enrolledCourses -createdAt -updatedAt -__v -EmailVerificationExpiry -EmailVerificationToken -id "
  )

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering user")
  }

  return res
    .status(201)
    .json(new ApiResponse(
      201, { user: createdUser }, "User created successfully\n verification email has been sent to your email"
    ));

});

/**
 * Authenticate user and get token
 * @route POST /api/v1/user/signin
 */
export const signIn = catchAsync(async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email }).select("+name")

  if (!user) {
    throw new ApiError(404, "user not found with these credientials\n register first to login")
  };

  const isPasswordValid = await user.isPasswordCorrect(password)


  if (!isPasswordValid) {
    throw new ApiError(400, "User doesn't exit\n Wrong Password")
  };

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  await user.updateLastActive()
  const loggedInUser = await User.findById(user._id).select(
    " -password -emailVerificationExpiry -emailVerificationToken  -refreshToken -accessToken -email -role -createdCourses -enrolledCourses -createdAt -updatedAt -lastActive -__v  -Avatar "
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
      new ApiResponse(200, { loggedInUser, accessToken, refreshToken }, "User logged-IN Successfully"),
    );

});

/**
 * Refresh token rotation
 * @route api/v1/user/refresh-token
 */


export const refreshTokenRotation = catchAsync(async (req, res) => {

  const incommingRefreshToken = req.cookies.refreshToken


  //only for debugging
  // console.log("\nIncomming token --- ",incommingRefreshToken);
  if (!incommingRefreshToken) {
    throw new ApiError(401, error.message)
  };

  // only for debugging
  // console.log(`Refresh Token ---${process.env.REFRESH_TOKEN_SECRET}`)

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

  // console.log(` Hashed Incoming Refresh ====  ${HashIncommingRefreshToken}`)
  // console.log("DataBase Refresh Token-- ", user.refreshToken)  ONly for debugging

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
    .json(
      new ApiResponse(200,
        { accessToken, refreshToken }
      ));

});

/**
 * Sign out user and clear cookie
 * @route POST /api/v1/user/signout
 */
export const signOut = catchAsync(async (req, res) => {
  const user = await User.findByIdAndUpdate(
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
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(
      new ApiResponse(200, {}, "User logout successfully")
    )
});

/**
 * Get current user profile
 * @route GET /api/v1/user/profile
 */
export const getCurrentUserProfile = catchAsync(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched"))
});

/**
 * Update user profile
 * @route PATCH /api/v1/user/profile
 */
export const updateUserProfile = catchAsync(async (req, res) => {
  const { name, email, bio } = req.body

  const user = await User.findById(req.user._id)

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
  ).select(" -password -isEmailVerified  -enrolledCourses -lastActive -createdAt -updatedAt -refreshToken -__v ")

  return res
    .status(200)
    .json(
      new ApiResponse(200, { data: UpdatedUser }, "User Updated successfully")
    )

});

/**
 * Change user password
 * @route PATCH /api/v1/user/password
 */
export const changeUserPassword = catchAsync(async (req, res) => {

  const { currentPassword, newPassword } = req.body

  const user = await User.findById(req.user.id).select(" +password")

  if (!user) {
    throw new ApiError(404, "User not found ")
  };

  // verify current password
  if (!(await user.isPasswordCorrect(currentPassword))) {
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
 * @route POST /api/v1/user/forgot-password
 */
export const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body

  const user = await User.findOne({ email })

  if (!user) {
    throw new ApiError(404, "User with this email not found")
  };
  const { tokenExpiry, unHashedToken, HashedToken } = user.generateTempToken();
  user.resetPasswordToken = HashedToken;
  user.resetPasswordExpire = tokenExpiry;
  await user.save({ validateBeforeSave: false });


  try {
    await sendEmail({
      email: user.email,
      subject: "We got a request to reset your password",
      mailgenContent: forgotPasswordMailgenContent(
        user.name,
        `${req.protocol}://${req.get('host')}/api/v1/user/forgot-password/${unHashedToken}`
      )
    });
  } catch (error) {
    throw new ApiError(500, `Forgot password mail not sent ${error.message}`)
  }


  return res
    .status(200)
    .json({
      sucess: true,
      message: " reset password instruction is sent to your email"
    });
});

/**
 * Reset password
 * @route POST /api/v1/user/reset-password/:passwordResetUrl
 */
export const resetPassword = catchAsync(async (req, res) => {
  const { passwordResetUrl } = req.params;
  const { password } = req.body;


  /**Debugging
   * 
  console.log("Incoming Token:", passwordResetUrl);
  
  console.log(
    "Hashed Incoming Token:",
    crypto.createHash("sha256")
      .update(passwordResetUrl)
      .digest("hex")
  );
  
   * 
   */

  const user = await User.findOne({
    resetPasswordToken: crypto.createHash('sha256').update(passwordResetUrl).digest('hex'),
    resetPasswordExpire: { $gt: Date.now() },
  });


  if (!user) {
    throw new ApiError(404, "User not found")
  };

  /**Debug the issue
     *   console.log(user.resetPasswordToken)
     * 
     * 
     */



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
 * @route DELETE /api/v1/user/account
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


/**
 * Verify User email
 * @route POST /api/v1/user/verify-email 
 */

export const userEmailVerification = catchAsync(async (req, res) => {
  const { verificationToken } = req.params

  if (!verificationToken) {
    throw new ApiError(404, "Email verification token not found..")
  };

  const hashedToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex')


  const user = await User.findOne({
    EmailVerificationToken: hashedToken,
    EmailVerificationExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(404, "Token is invalid or expired..")
  };

  user.EmailVerificationToken = undefined;
  user.EmailVerificationExpiry = undefined;

  user.isEmailVerified = true

  await user.save({ validateBeforeSave: false })

  return res
    .status(200)
    .json(
      new ApiResponse(200, { isEmailVerified: true }, "Email is verified")
    )
});

/**
 * Resend Mail verification
 * @route POST /api/v1/user/resend-Email
 */
export const resendEmailVerification = catchAsync(async (req, res) => {

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found")
  };


  if (user.isEmailVerified) {
    throw new ApiError(400, "User email has already been verified..")
  };

  const { unHashedToken, HashedToken, tokenExpiry } = user.generateTempToken()


  user.EmailVerificationToken = HashedToken;
  user.EmailVerificationExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  try {
    await sendEmail({
      email: user.email,
      subject: "We have received your request to verify you email..",
      mailgenContent: emailVerificationMailgenContent(
        user.name,
        `${req.protocol}://${req.get('host')}/api/v1/user/verify-email/${unHashedToken} `
      )
    });
    console.log("Resend Email verification ✅")
  } catch (error) {
    throw new ApiError(500, "Failed to send verification email..")
  };
  return res
    .status(200)
    .json(
      new ApiResponse(200, {}, "Verification email sent successfully.")
    )

});