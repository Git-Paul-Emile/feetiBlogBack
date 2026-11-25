import type { RequestHandler } from "express";
import { NotFoundError } from "../errors/NotFoundError.js";

export const notFound: RequestHandler = (_request, _response, next) => {
  next(new NotFoundError());
};
