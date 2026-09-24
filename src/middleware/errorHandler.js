import { HttpError } from "../utils/HttpError.js";

export const notFound = (_req, res) =>
  res.status(404).json({ message: "Route not found.", code: "NOT_FOUND" });

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) {
    return res
      .status(err.status)
      .json({ message: err.message, code: err.code, errors: err.errors });
  }
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON body.", code: "BAD_JSON" });
  }
  console.error(err);
  res.status(500).json({ message: "Something went wrong.", code: "SERVER_ERROR" });
}
