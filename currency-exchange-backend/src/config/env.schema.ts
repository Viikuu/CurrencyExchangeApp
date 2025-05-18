import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  EXCHANGE_API_URL: Joi.string().uri().required(),
  EXCHANGE_API_KEY: Joi.string().required(),
  EXCHANGE_API_TIMEOUT: Joi.number().integer().min(0).required(),
  EXCHANGE_API_MAX_RETRIES: Joi.number().integer().min(0).required(),
  EXCHANGE_API_RETRY_DELAY_MS: Joi.number().integer().min(0).required(),
  EXCHANGE_RATE_CACHE_KEY: Joi.string().required(),

  NODE_ENV: Joi.string().valid('local', 'prod').required(),
  PORT: Joi.number().optional(),

  DB_HOST: Joi.string().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
  DB_PORT: Joi.number().optional(),
}).required();
