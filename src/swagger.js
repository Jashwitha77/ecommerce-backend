const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0', // OpenAPI version standard
    info: {
      title: 'E-Commerce Backend API',
      version: '1.0.0',
      description: 'API Documentation for User Management and Product Catalog',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { // Defines JWT Bearer token authentication
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  // Path to the API docs (where your route files live)
  apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(options);

module.exports = { swaggerUi, swaggerDocs };