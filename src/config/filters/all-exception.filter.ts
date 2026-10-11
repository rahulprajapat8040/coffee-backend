import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { EmptyResultError } from 'sequelize';

type ErrorResponse = {
  message?: string;
  [key: string]: unknown;
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: ErrorResponse | string;

    if (exception instanceof EmptyResultError) {
      exception = new NotFoundException('Data not found');
    }

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      errorResponse = exception.getResponse() as ErrorResponse | string;
    } else {
      const errorMessage =
        (exception as Error)?.message ?? 'Internal Server Error.';

      errorResponse = {
        message: 'Internal Server Error.',
        error: errorMessage,
      };

      this.logger.error(
        `Unhandled exception for ${request.method} ${request.url}`,
        (exception as Error)?.stack,
      );
    }

    const responseBody: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (typeof errorResponse === 'string') {
      responseBody.message = errorResponse;
    } else {
      Object.assign(responseBody, errorResponse);
    }

    response.status(status).json(responseBody);
    console.log('error is', responseBody);
  }
}