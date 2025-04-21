import * as Joi from 'joi';

export const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().required(),
  // SECRET_TOKEN: Joi.string().required(),
  // GRPC_AUTH_URL: Joi.string().required(),
  GRPC_FORGE_URL: Joi.string().required(),
});
