import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken"


const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            maxLength: [50, "Name cannot exced 50 character"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
            match: [
                /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
                "Please provide a valid email",
            ],
        },
        isEmailVerified: {
            type: String,
            default: false
        },
        password: {
            type: String,
            required: [true, "password is required"],
            minLength: [8, "password must be 8 character"],
            // select: false,
        },
        role: {
            type: String,
            enum: {
                values: ["student", "Instructor", "Admin"],
                message: "Please select a valid role",
            },
            default: "Student",
        },
        avatar: {
            type: String,
            default: "default-avatar.png",
        },
        bio: {
            type: String,
            maxLength: [200, "Bio cannot exceed 200 characters"],
        },
        enrolledCourses: [
            {
                courses: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Course",
                },
                enrolledAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        createdCourses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Courses"
            },
        ],

        resetPasswordToken: String,

        resetPasswordExpire: Date,

        refreshToken: String,

        refreshTokenExpiry: Date,

        EmailVerificationToken: String,

        EmailVerificationExpiry: Date,
        lastActive: {
            type: Date,
            default: Date.now
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);


userSchema.pre("save", async function () {
    if (!this.isModified("password"))
        return
    this.password = await bcrypt.hash(this.password, 12)
});


userSchema.methods.isPasswordCorrect = async function (Password) {
    return await bcrypt.compare(Password, this.password)
};



userSchema.methods.generateResetPasswordToken = async function () {
    const resetToken = crypto.randomBytes(32).toString("hex")
    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest('hex')

    this.resetPasswordExpire = Date.now() + (5 * 60 * 1000) // 5 minutes

    return resetToken
}


userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        role: this.role,
        name: this.name
    },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }

    )
}



userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id,
        role: this.role,
        name: this.name
    },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    )
};



userSchema.methods.generateTempToken = function () {
    const unHashedToken = crypto.randomBytes(32).toString('hex')


    const HashedToken = crypto
        .createHash('sha256')
        .update(unHashedToken)
        .digest("hex")

    const tokenExpiry = Date.now() + (5 * 60 * 1000)

    return { unHashedToken, HashedToken, tokenExpiry }
}


userSchema.methods.updateLastActive = function () {
    this.lastActive = Date.now()
    return this.save({ validateBeforeSave: false })
};

export default mongoose.model("User", userSchema)