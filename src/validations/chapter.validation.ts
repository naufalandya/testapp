import Joi from "joi";

export const createChapterSchema = Joi.object({
    title: Joi.string().min(3).max(255).required().messages({
        "string.base": "Title must be a string",
        "string.min": "Title must be at least 3 characters long",
        "string.max": "Title must be at most 255 characters long",
        "any.required": "Title is required",
    }),
    description: Joi.string().allow(null, "").max(1000).messages({
        "string.max": "Description must be at most 1000 characters long",
    }),
});

export const createTopicSchema = Joi.object({
    title: Joi.string()
        .trim()
        .min(3)
        .max(255)
        .required()
        .messages({
            "string.base": "Title must be a valid string.",
            "string.min": "Title must be at least 3 characters long.",
            "string.max": "Title must not exceed 255 characters.",
            "string.empty": "Title cannot be empty.",
            "any.required": "Title is required."
        }),

    description: Joi.string()
        .trim()
        .optional()
        .allow(null, "")
        .messages({
            "string.base": "Description must be a valid string."
        }),

    chapter_id: Joi.number()
        .integer()
        .required()
        .messages({
            "number.base": "Chapter ID must be a valid number.",
            "number.integer": "Chapter ID must be an integer.",
            "any.required": "Chapter ID is required."
        }),
});


export const createQuestionSchema = Joi.object({
    title: Joi.string()
        .trim()
        .optional()
        .allow(null, "")
        .max(255)
        .messages({
            "string.base": "Title must be a valid string.",
            "string.max": "Title must not exceed 255 characters."
        }),

    description: Joi.string()
        .trim()
        .optional()
        .allow(null, "")
        .max(1000)
        .messages({
            "string.base": "Description must be a valid string.",
            "string.max": "Description must not exceed 1000 characters."
        }),

    question: Joi.string()
        .trim()
        .required()
        .messages({
            "string.base": "Question must be a valid string.",
            "string.empty": "Question cannot be empty.",
            "any.required": "Question is required."
        }),

    subtopic_id: Joi.number()
        .integer()
        .optional()
        .allow(null)
        .messages({
            "number.base": "Subtopic ID must be a valid number.",
            "number.integer": "Subtopic ID must be an integer."
        }),

    difficulty_id: Joi.number()
        .integer()
        .optional()
        .allow(null)
        .messages({
            "number.base": "Difficulty ID must be a valid number.",
            "number.integer": "Difficulty ID must be an integer."
        }),

    explanation: Joi.string()
        .trim()
        .optional()
        .allow(null, "")
        .max(2000)
        .messages({
            "string.base": "Explanation must be a valid string.",
            "string.max": "Explanation must not exceed 2000 characters."
        }),

    explanation_image: Joi.string()
        .uri()
        .optional()
        .allow(null, "")
        .messages({
            "string.uri": "Explanation image must be a valid URL."
        }),

    time_limit: Joi.number()
        .integer()
        .min(10)
        .max(600)
        .optional()
        .allow(null)
        .messages({
            "number.base": "Time limit must be a valid number.",
            "number.integer": "Time limit must be an integer.",
            "number.min": "Time limit must be at least 10 seconds.",
            "number.max": "Time limit must not exceed 600 seconds."
        }),

    type_id: Joi.number()
        .integer()
        .required()
        .messages({
            "number.base": "Type ID must be a valid number.",
            "number.integer": "Type ID must be an integer.",
            "any.required": "Type ID is required."
        }),

    tag_id: Joi.number()
        .integer()
        .optional()
        .allow(null)
        .messages({
            "number.base": "Tag ID must be a valid number.",
            "number.integer": "Tag ID must be an integer."
        }),

    is_active: Joi.boolean()
        .optional()
        .default(true)
        .messages({
            "boolean.base": "Is Active must be a boolean value."
        }),

    created_by: Joi.string()
        .trim()
        .optional()
        .allow(null, "")
        .messages({
            "string.base": "Created by must be a valid string."
        }),

    updated_by: Joi.string()
        .trim()
        .optional()
        .allow(null, "")
        .messages({
            "string.base": "Updated by must be a valid string."
        }),
});