import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Proxi Reporting Service API',
            version: '1.0.0',
            description: 'API documentation for the Proxi School Management System PDF Reporting Service',
        },
        servers: [
            {
                url: 'http://localhost:3001',
                description: 'Reporting Service Server',
            },
        ],
    },
    // Pattern to find files containing Swagger documentation annotations
    apis: ['./src/routes/*.ts', './src/index.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
