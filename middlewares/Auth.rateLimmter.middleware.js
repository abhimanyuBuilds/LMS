import { rateLimit } from 'express-rate-limit'


const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15min 
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        status: 429,
        message: "Too many request. please try again later"
    }
});

const signUpRateLimit = rateLimit({
    windowMs: 10 * 60 * 1000,// 10 min
    limit: 5,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    ipv6Subnet: 56
});


const signInRateLimit = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    ipv6Subnet: 56
});

const signOutRateLimit = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    ipv6Subnet: 56
});


const getCurrentUserRateLimit = rateLimit({
    windowMs: 20 * 60 * 1000,
    limit: 25,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    ipv6Subnet: 56
});


const updateUserProfileRateLimit = rateLimit({
    windowMs: 20 * 60 * 1000,
    limit: 15,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    ipv6Subnet: 56
});


const changeUserPasswordRateLimit = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 3,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    ipv6Subnet: 56
});


const forgotPasswordRateLimit = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 3,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    ipv6Subnet: 56
});


const resetPasswordRateLimit = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 3,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    ipv6Subnet: 56
});


const deleteUserAccountRateLimit = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 3,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    ipv6Subnet: 56
})

const resendMailVerficicationRateLimit = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 2,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    ipv6Subnet: 56,
    message: {
        success: false,
        message:
            "Too many verification requests. Please try again after 5 minutes."
    }
});


export {
    signUpRateLimit, signInRateLimit,
    signOutRateLimit, getCurrentUserRateLimit,
    updateUserProfileRateLimit, changeUserPasswordRateLimit,
    forgotPasswordRateLimit, resetPasswordRateLimit, deleteUserAccountRateLimit, resendMailVerficicationRateLimit, apiLimiter
}