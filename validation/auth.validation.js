import Joi from "joi";


const passwordRegex =
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,20}$/;



export const validateSignUp = Joi.object({

    name: Joi.string()
        .trim()
        .min(2)
        .max(30)
        .pattern(/^[a-zA-Z\s]+$/)
        .required()
        .messages({

            "string.empty":"Name is required",

            "string.min":
            "Name must contain at least 2 characters",

            "string.max":
            "Name cannot exceed 30 characters",

            "string.pattern.base":
            "Name can contain only letters and spaces"

        }),


    email: Joi.string()
        .email()
        .required()
        .messages({

            "string.empty":
            "Email is required",

            "string.email":
            "Please provide a valid email"

        }),


    password: Joi.string()
        .min(8)
        .max(20)
        .pattern(passwordRegex)
        .required()
        .messages({

            "string.empty":
            "Password is required",

            "string.min":
            "Password must contain at least 8 characters",

            "string.max":
            "Password cannot exceed 20 characters",

            "string.pattern.base":
            "Password must contain one uppercase letter, one lowercase letter, one number and one special character"

        }),


    role: Joi.string()
        .valid(

            "student",
            "Instructor",
            "Admin"

        )
        // .required()
        .messages({

            "any.required":
            "Role is required",

            "any.only":
            "Invalid role selected"

        })

});



export const validateSignIn = Joi.object({

    email: Joi.string()
        .email()
        .required(),

    password: Joi.string()
        .min(8)
        .required()

});



export const validatePasswordChanged = Joi.object({

    currentPassword:
    Joi.string()
    .required(),


    newPassword:
    Joi.string()
    .min(8)
    .max(20)
    .pattern(passwordRegex)
    .invalid(
        Joi.ref("currentPassword")
    )
    .required()
    .messages({

        "any.invalid":
        "New password must be different from the current password",

        "string.pattern.base":
        "Password must contain one uppercase letter, one lowercase letter, one number and one special character"

    })

});



export const paginationSchema = Joi.object({

    page:Joi.number()
    .integer()
    .min(1)
    .default(1),

    limit:Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)

}); 