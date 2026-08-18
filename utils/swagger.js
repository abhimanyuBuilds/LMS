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
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        }
    },

    apis: [
        "../src/routes/*.js",
        "../src/controllers/*.js"
    ]
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;