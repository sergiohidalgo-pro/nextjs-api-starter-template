import swaggerJSDoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Cl-init-api-nextjs API',
      version: '1.0.0',
      description: 'A Next.js API with JWT authentication and 2FA support',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/app/api/**/*.ts'], // Path to the API files
};

export const swaggerSpec = swaggerJSDoc(options);