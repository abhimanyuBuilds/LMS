import { rateLimit } from 'express-rate-limit'



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
    windowMS: 10 * 60 * 1000,
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




export {
    signUpRateLimit, signInRateLimit,
    signOutRateLimit, getCurrentUserRateLimit,
    updateUserProfileRateLimit, changeUserPasswordRateLimit,
    forgotPasswordRateLimit, resetPasswordRateLimit, deleteUserAccountRateLimit
}