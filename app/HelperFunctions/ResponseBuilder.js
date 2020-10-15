'use strict'

const { StatusCodes } = require('http-status-codes');

const GENERIC_ERROR_MESSAGE = 'An error has occurred, please try again.';

function successResponse(responseObject, responseData, statusCode = StatusCodes.OK) {
  return responseObject.status(statusCode).json({
    success: true,
    ...responseData,
  });
}

function errorResponse(responseObject, errorObject, statusCode = StatusCodes.INTERNAL_SERVER_ERROR) {
  const responseData = {};

  if (errorObject.message) responseData.message = errorObject.message;
  else if (errorObject.error) responseData.error = errorObject.error;
  else responseData.error = GENERIC_ERROR_MESSAGE;

  return responseObject.status(statusCode).json({
    success: false,
    ...responseData,
  });
}

module.exports = { successResponse, errorResponse }