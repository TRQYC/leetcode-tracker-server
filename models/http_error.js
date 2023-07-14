class HttpError extends Error {
    constructor(statusCode=500, message = "internal error", errorCode = 1) {
      super(message);
      this.code = errorCode;
      this.statusCode = statusCode;
    }
  }
  
  module.exports = HttpError;