import * as Joi from 'joi';

export const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().required(),
  DB_PORT: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DATABASE_URL: Joi.string().required(),
  SECRET_TOKEN: Joi.string().required(),
  GRPC_FORGE_URL: Joi.string().required(),
  RMQ_CONTACT_URL: Joi.string().required(),
  RMQ_CONTACT_QUEUE: Joi.string().required(),
});
