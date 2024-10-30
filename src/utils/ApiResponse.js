class ApiResponse {
  constructor(statusCode, data, message = "ok", success = true) {
    (this.statusCode = statusCode), (this.data = data);
    this.message = message;
    this.status = statusCode < 400;
    this.success = success;
  }
}
export { ApiResponse };
