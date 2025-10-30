import swaggerJsdoc from 'swagger-jsdoc';
import swaggerDefinition from './swagger.json' with { type: "json" };

const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: ['./routes/*.js'],
};


export const specs = swaggerJsdoc(options);