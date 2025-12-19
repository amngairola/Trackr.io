class ApiError extends Error {
  constructor(statusCode, message, errrors = []) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.error = errrors;
  }
}

export default ApiError;
