import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.ts';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { patchNestjsSwagger } from '@anatine/zod-nestjs';
import assert from 'node:assert';
import { NestApplicationOptions } from '@nestjs/common';
import { loggerSingletonInstance } from '../libs/logger/loggerInstance.ts';
import { NestLoggerAdapter } from '../libs/logger/NestLoggerAdapter.ts';

export class AppConfigurator {
  protected app: NestExpressApplication | undefined;

  public async initApp() {
    this.app = await this.createAppInstance();
    await this.configureHttpApi(this.app);
  }

  public async startAsPersistentInstance() {
    assert(this.app, 'App not initialized');

    this.configureSwagger(this.app);
    this.app.enableShutdownHooks(['SIGINT']);
    const port = process.env.HTTP_PORT ?? 3000;
    await this.app.listen(port);
    loggerSingletonInstance.debug(`HTTP API listen on port ${port}`);
  }

  public async stop() {
    assert(this.app, 'App not initialized');
    await this.app.close();
  }

  protected getAppOptions(): NestApplicationOptions {
    return {
      logger: new NestLoggerAdapter(loggerSingletonInstance),
    };
  }

  protected async createAppInstance(): Promise<NestExpressApplication> {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, this.getAppOptions());
    return app;
  }

  protected async configureHttpApi(app: NestExpressApplication) {
    app.enableCors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 86400,
    });
    app.set('trust proxy', true);
    app.set('x-powered-by', false);
    app.set('etag', false);

    patchNestjsSwagger();

    return app;
  }

  protected configureSwagger(app: NestExpressApplication) {
    const config = new DocumentBuilder()
      .setTitle('Quarkly AI API')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'apiKey',
          bearerFormat: 'JWT',
          name: 'authorization',
          in: 'header',
        },
        'JWT',
      )
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        filter: true,
        tryItOutEnabled: true,
      },
    });
  }
}
