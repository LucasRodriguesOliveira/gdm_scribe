import { SwaggerConfig } from '../types/swagger.interface';

export const SWAGGER_TOKEN = Symbol('swagger');

export const swaggerConfig = (): { swagger: SwaggerConfig } => {
  const { API_NAME, API_DESCRIPTION, API_VERSION } = process.env;

  return {
    swagger: {
      api: {
        name: API_NAME,
        description: API_DESCRIPTION,
        version: API_VERSION,
      },
      docs: {
        path: '/docs',
      },
    },
  };
};
