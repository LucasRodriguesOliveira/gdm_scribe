/**
 * Codes based on common prisma errors
 *
 * DB -> Database
 *
 * OP -> Operation
 *
 * RQ -> Raw Query
 *
 * @see https://www.prisma.io/docs/orm/reference/error-reference#error-codes
 */
export enum DatabaseErrors {
  DB_AUTHENTICATION_FAILED = 'P1000',
  DB_UNREACHEABLE = 'P1001',
  DB_TIMEOUT = 'P1002',
  DB_DOES_NOT_EXIST = 'P1003',
  OP_TIMEOUT = 'P1008',
  ACCESS_DENIED = 'P1010',
  RQ_INCORRECT_NUMBER_OF_PARAMETERS = 'P1016',
  UNIQUE_CONSTRAINT = 'P2002',
  FOREIGN_KEY = 'P2003',
  CONSTRAINT_FAILED = 'P2004',
  DATA_VALIDATION_ERROR = 'P2007',
  RQ_FAILED = 'P2010',
  NULL_CONSTRAINT = 'P2011',
  MISSED_REQUIRED_VALUE = 'P2012',
  TABLE_DOES_NOT_EXISTS = 'P2021',
  COLUMN_DOES_NOT_EXISTS = 'P2022',
  NOT_FOUND = 'P2025',
  MULTIPLE_ERRORS = 'P2027',
  TRANSACTION_API_ERROR = 'P2028',
  DEADLOCK = 'P2034',
  TOO_MANY_DATABASE_CONNECTIONS = 'P2037',

  // user created value
  UNEXPECTED = 'U0001',
}
