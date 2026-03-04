"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Proxi Reporting Service API',
            version: '1.0.0',
            description: 'API documentation for the Proxi School Management System PDF Reporting Service',
        },
        servers: [
            {
                url: '/reports',
                description: 'Relative Path (Works dynamically based on host)',
            },
            {
                url: 'http://localhost:3001',
                description: 'Local Reporting Service Server',
            },
        ],
    },
    // Pattern to find files containing Swagger documentation annotations
    apis: ['./src/routes/*.ts', './src/index.ts'],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
exports.default = swaggerSpec;
