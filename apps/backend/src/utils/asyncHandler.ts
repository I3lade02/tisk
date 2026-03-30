import type { NextFunction, Request, Response } from "express";

type AsyncRoute = (
  request: Request,
  response: Response,
  next: NextFunction
) => Promise<void> | Promise<Response> | void;

export function asyncHandler(handler: AsyncRoute) {
  return (request: Request, response: Response, next: NextFunction) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}
