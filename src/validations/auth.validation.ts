import Joi from 'joi'

export const Register = Joi.object({
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            "string.empty": "Email is required.",
            "string.email": "Please provide a valid email address.",
            "any.required": "Email is required."
        }),

    username: Joi.string()
        .alphanum()
        .min(4)
        .max(20)
        .required()
        .messages({
            "string.empty": "Username is required.",
            "string.alphanum": "Username must contain only letters and numbers.",
            "string.min": "Username must be at least {#limit} characters long.",
            "string.max": "Username cannot exceed {#limit} characters.",
            "any.required": "Username is required."
        }),

    password: Joi.string()
        .min(8)
        .max(30)
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"))
        .required()
        .messages({
            "string.empty": "Password is required.",
            "string.min": "Password must be at least {#limit} characters long.",
            "string.max": "Password cannot exceed {#limit} characters.",
            "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
            "any.required": "Password is required."
        }),

    fullName: Joi.string()
        .trim()
        .min(3)
        .max(50)
        .required()
        .messages({
            "string.empty": "Full name is required.",
            "string.min": "Full name must be at least {#limit} characters long.",
            "string.max": "Full name cannot exceed {#limit} characters.",
            "any.required": "Full name is required."
        })
});

export const Login = Joi.object({
    identifier: Joi.string()
        .required()
        .messages({
            "string.empty": "Email or username is required.",
            "any.required": "Email or username is required."
        }),

    password: Joi.string()
        .min(8)
        .max(30)
        .required()
        .messages({
            "string.empty": "Password is required.",
            "string.min": "Password must be at least {#limit} characters long.",
            "string.max": "Password cannot exceed {#limit} characters.",
            "any.required": "Password is required."
        })
});