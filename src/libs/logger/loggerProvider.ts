import { FactoryProvider } from '@nestjs/common';
import { loggerSingletonInstance } from './loggerInstance.ts';

export const APP_LOGGER_TOKEN = Symbol('APP_LOGGER_TOKEN');

export const loggerProvider: FactoryProvider = {
  provide: APP_LOGGER_TOKEN,
  useFactory() {
    return loggerSingletonInstance;
  },
};
