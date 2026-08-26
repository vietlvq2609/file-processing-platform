import type { FastifySchema } from 'fastify';

export const registerBodySchema = {
  type: 'object',
  required: ['email', 'password'],
  additionalProperties: false,
  properties: {
    email: { type: 'string', format: 'email', maxLength: 255 },
    password: { type: 'string', minLength: 8, maxLength: 128 },
  },
} as const;

export const loginBodySchema = {
  type: 'object',
  required: ['email', 'password'],
  additionalProperties: false,
  properties: {
    // Intentionally no format/length constraints on login — any non-empty value is passed
    // to bcrypt.compare so we don't leak information about the stored password rules.
    email: { type: 'string', minLength: 1 },
    password: { type: 'string', minLength: 1 },
  },
} as const;

export const registerSchema: FastifySchema = {
  body: registerBodySchema,
};

export const loginSchema: FastifySchema = {
  body: loginBodySchema,
};

export const changePasswordBodySchema = {
  type: 'object',
  required: ['currentPassword', 'newPassword'],
  additionalProperties: false,
  properties: {
    currentPassword: { type: 'string', minLength: 1 },
    newPassword: { type: 'string', minLength: 8, maxLength: 128 },
  },
} as const;

export const changePasswordSchema: FastifySchema = {
  body: changePasswordBodySchema,
};
