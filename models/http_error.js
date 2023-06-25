class HttpError extends Error {
    constructor(message, errorCode, statusCode=500) {
      super(message);
      this.code = errorCode;
      this.statusCode = statusCode;
    }
  }
  
  module.exports = HttpError;