import Joi from "joi";

export const setupProfileSchema = Joi.object({
    fullname: Joi.string()
        .min(3)
        .max(50)
        .required()
        .messages({
            "string.min": "Full name must be at least 3 characters long.",
            "string.max": "Full name must not exceed 50 characters.",
            "any.required": "Full name is required.",
            "string.empty": "Full name cannot be empty."
        }),

    phone_number: Joi.string()
        .pattern(/^\+?\d{10,15}$/)
        .optional()
        .allow(null, "")
        .messages({
            "string.pattern.base": "Phone number must be a valid international format with 10 to 15 digits."
        }),

    birth_date: Joi.date()
        .iso()
        .optional()
        .allow(null)
        .messages({
            "date.base": "Birth date must be a valid date.",
            "date.format": "Birth date must be in ISO format (YYYY-MM-DD)."
        }),

    address: Joi.string()
        .max(255)
        .optional()
        .allow(null, "")
        .messages({
            "string.max": "Address must not exceed 255 characters."
        }),

    city: Joi.string()
        .max(100)
        .optional()
        .allow(null, "")
        .messages({
            "string.max": "City name must not exceed 100 characters."
        }),

    country: Joi.string()
        .max(100)
        .optional()
        .allow(null, "")
        .messages({
            "string.max": "Country name must not exceed 100 characters."
        }),

    gender: Joi.string()
        .valid("male", "female", "other")
        .optional()
        .allow(null, "")
        .messages({
            "any.only": "Gender must be either 'male', 'female', or 'other'."
        }),

    school: Joi.string()
        .max(100)
        .optional()
        .allow(null, "")
        .messages({
            "string.max": "School name must not exceed 100 characters."
        }),

    class: Joi.string()
        .max(50)
        .optional()
        .allow(null, "")
        .messages({
            "string.max": "Class name must not exceed 50 characters."
        }),

    graduation_year: Joi.number()
        .integer()
        .min(1900)
        .max(new Date().getFullYear() + 5)
        .optional()
        .allow(null, "")
        .messages({
            "number.base": "Graduation year must be a valid number.",
            "number.integer": "Graduation year must be an integer.",
            "number.min": "Graduation year must not be earlier than 1900.",
            "number.max": `Graduation year must not be later than ${new Date().getFullYear() + 5}.`
        }),
});
