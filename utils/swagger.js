import swaggerJSDoc from "swagger-jsdoc";



const options = {
    definition: {
        openapi: "3.0.0",

        info: {
            title: "LAMS API",
            version: "1.0.0",
            description: "Learning Management System Backend API"
        },

        servers: [
            {
                url: "http://localhost:5050/LAMS",
                description: "Local Development"
            }
        ],

        components: {

            // ==============================
            // Authentication
            // ==============================
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            },

            // ==============================
            // Reusable Schemas
            // ==============================
            schemas: {

                // ==============================
                // Course Schema
                // ==============================
                Course: {
                    type: "object",

                    properties: {

                        _id: {
                            type: "string",
                            description: "MongoDB ObjectId of the course",
                            example: "64f123456789abcdef123456"
                        },

                        title: {
                            type: "string",
                            description: "Course title",
                            maxLength: 100,
                            example: "Complete Node.js Backend Development"
                        },

                        subtitle: {
                            type: "string",
                            description: "Short subtitle describing the course",
                            maxLength: 200,
                            example: "Learn Node.js, Express, MongoDB and REST APIs"
                        },

                        description: {
                            type: "string",
                            description: "Detailed course description",
                            example: "A complete backend development course using Node.js."
                        },

                        category: {
                            type: "string",
                            description: "Course category",
                            example: "Backend Development"
                        },

                        level: {
                            type: "string",
                            description: "Course difficulty level",
                            enum: [
                                "beginner",
                                "intermediate",
                                "advanced"
                            ],
                            example: "intermediate"
                        },

                        price: {
                            type: "number",
                            minimum: 0,
                            description: "Course price",
                            example: 999
                        },

                        thumbnail: {
                            type: "string",
                            description: "Course thumbnail URL",
                            example: "https://example.com/course-thumbnail.jpg"
                        },

                        enrolledStudents: {
                            type: "array",
                            description: "Users enrolled in the course",

                            items: {
                                type: "string",
                                example: "64f123456789abcdef123456"
                            }
                        },

                        lectures: {
                            type: "array",
                            description: "Lectures belonging to the course",

                            items: {
                                type: "string",
                                example: "64f123456789abcdef123458"
                            }
                        },

                        instructor: {
                            type: "object",
                            description: "Course instructor",

                            properties: {

                                _id: {
                                    type: "string",
                                    example: "64f123456789abcdef123460"
                                },

                                name: {
                                    type: "string",
                                    example: "Abhimanyu Singh"
                                },

                                avatar: {
                                    type: "string",
                                    example: "https://example.com/avatar.jpg"
                                }
                            }
                        },

                        isPublished: {
                            type: "boolean",
                            description: "Whether the course is published",
                            example: true
                        },

                        totalDuration: {
                            type: "number",
                            description: "Total duration of all lectures",
                            example: 7200
                        },

                        totalLectures: {
                            type: "integer",
                            description: "Total number of lectures",
                            example: 24
                        },

                        averageRating: {
                            type: "number",
                            description: "Average course rating",
                            example: 0
                        },

                        createdAt: {
                            type: "string",
                            format: "date-time",
                            example: "2026-08-18T07:30:00.000Z"
                        },

                        updatedAt: {
                            type: "string",
                            format: "date-time",
                            example: "2026-08-18T07:30:00.000Z"
                        }
                    }
                },

                // ==============================
                // Error Schema
                // ==============================
                Error: {
                    type: "object",

                    properties: {

                        status: {
                            type: "string",
                            example: "error"
                        },

                        message: {
                            type: "string",
                            example: "Something went wrong!"
                        }
                    }
                }
            }
        }
    },

    // ==============================
    // Swagger Documentation Sources
    // ==============================
    apis: [
        "./src/routes/*.js",
        "./src/controllers*.js"
    ]
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;

console.log(
    "Swagger API url ====    http://localhost:5050/LAMS"
);