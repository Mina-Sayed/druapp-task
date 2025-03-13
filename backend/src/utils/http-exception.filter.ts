import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const errorResponse = exception.getResponse();

    const errorMessage = 
      typeof errorResponse === 'object' && 'message' in errorResponse
        ? errorResponse['message']
        : exception.message;

    const errorObj = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: errorMessage,
    };

    // Log the error details
    this.logger.error(
      `${request.method} ${request.url} ${status}`,
      errorMessage,
      request.headers['x-request-id'] || 'no-request-id',
    );

    response.status(status).json(errorObj);
  }
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Determine if this is a known HTTP exception or an unknown error
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';
    
    if (exception instanceof HttpException) {
      const errorResponse = exception.getResponse();
      message = 
        typeof errorResponse === 'object' && 'message' in errorResponse
          ? (errorResponse['message'] as string)
          : exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const errorObj = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: status === HttpStatus.INTERNAL_SERVER_ERROR 
        ? 'Internal server error' // Don't expose internal error details to client
        : message,
    };

    // Log the full error details for debugging
    this.logger.error(
      `${request.method} ${request.url} ${status}`,
      exception instanceof Error ? exception.stack : String(exception),
      request.headers['x-request-id'] || 'no-request-id',
    );

    response.status(status).json(errorObj);
  }
} 