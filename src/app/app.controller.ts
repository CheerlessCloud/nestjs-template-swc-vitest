import { Controller, Get, Inject, UsePipes } from '@nestjs/common';
import { AppService } from './app.service.ts';
import { createZodDto, ZodValidationPipe } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { z } from 'zod';
import { ApiOkResponse } from '@nestjs/swagger';
import { LoggerWithRequest } from '../libs/logger/InjectLogger.ts';
import { Logger } from 'winston';

export const HealthCheckResponseSchema = extendApi(
  z.object({
    id: z.string(),
    status: z.string(),
    createdAt: z.date(),
  }),
  {
    title: 'Health Check',
    description: 'Health check response',
  },
);
export class HealthCheckResponseDto extends createZodDto(HealthCheckResponseSchema) {}

@Controller()
@UsePipes(ZodValidationPipe)
export class AppController {
  constructor(@Inject(AppService) private readonly appService: AppService) {}

  @Get('/health')
  @ApiOkResponse({ type: HealthCheckResponseDto })
  async healthCheck(@LoggerWithRequest() logger: Logger): Promise<HealthCheckResponseDto> {
    const healthCheck = await this.appService.getStatus();
    logger.info('Health check request handled', { status: healthCheck.status });
    return healthCheck;
  }
}
