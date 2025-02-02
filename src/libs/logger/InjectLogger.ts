import { createParamDecorator, ExecutionContext, Inject } from '@nestjs/common';
import { APP_LOGGER_TOKEN } from './loggerProvider.ts';
import { loggerSingletonInstance } from './loggerInstance.ts';
import { Request } from 'express';

export const InjectLogger = () => Inject(APP_LOGGER_TOKEN);

export const LoggerWithRequest = createParamDecorator((misc, cxt: ExecutionContext) => {
  const request = cxt.switchToHttp().getRequest<Request>();

  return loggerSingletonInstance.child({
    request,
  });
});
