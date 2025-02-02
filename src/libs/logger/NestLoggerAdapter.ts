/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, LoggerService } from '@nestjs/common';
import { Logger } from 'winston';
import { InjectLogger } from './InjectLogger.ts';

@Injectable()
export class NestLoggerAdapter implements LoggerService {
  private readonly mutedContexts = new Set([
    'InstanceLoader',
    'InstanceLoader',
    'NestMicroservice',
    'RouterExplorer',
    'RoutesResolver',
  ]);

  public constructor(@InjectLogger() private readonly logger: Logger) {}

  error(message: any, stackOrContext?: string): void;
  error(message: any, stack?: string, context?: string): void;
  error(error: Error, ignored: undefined, context?: string): void;
  error(message: any, ...optionalParams: [...any, string?, string?]): void {
    if (optionalParams[1] === 'ExceptionsHandler') {
      this.logger.error(optionalParams[1], { error: message });
    } else {
      this.logger.error(message, ...optionalParams);
    }
  }

  warn(message: any, context?: string): void;
  warn(message: any, ...optionalParams: [...any, string?]): void {
    this.logger.warn(message, ...optionalParams);
  }

  debug(message: any, context?: string): void;
  debug(message: any, ...optionalParams: [...any, string?]): void {
    this.logger.debug(message, ...optionalParams);
  }

  verbose(message: any, context?: string): void;
  verbose(message: any, ...optionalParams: [...any, string?]): void {
    this.logger.verbose(message, ...optionalParams);
  }

  log(message: string, context?: string): void;
  log(message: string, ...optionalParams: unknown[]): void {
    if (optionalParams[0] && this.mutedContexts.has(optionalParams[0] as string)) {
      return;
    }

    this.logger.info(message, ...optionalParams);
  }
}
