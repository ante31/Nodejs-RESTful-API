import swaggerJsDoc from "swagger-jsdoc";

const options = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: "Library API",
            version: "1.0.0",
        },
    },
    apis: ["./server.js"], // Replace this with the actual path to your route files
};

const swaggerDocs = swaggerJsDoc(options);

export default swaggerDocs;
