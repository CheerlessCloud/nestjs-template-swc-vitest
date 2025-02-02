import '../src/libs/dotenv-loader.ts';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppConfigurator } from '../src/app/app.configurator.ts';
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { AppModule } from '../src/app/app.module.ts';
import assert from 'node:assert';
import { INestApplication, ModuleMetadata } from '@nestjs/common';
import request from 'supertest';
import { beforeAll, afterAll, afterEach } from 'vitest';
import { loggerSingletonInstance } from '../src/libs/logger/loggerInstance.ts';
import { EntityClass, MongoEntityRepository } from '@mikro-orm/mongodb';
import { MikroORM } from '@mikro-orm/core';

export interface IInitialContext {
  module: TestingModule;
  app: INestApplication;
  agent: ReturnType<typeof request.agent>;
  rootModuleDefinition?: ModuleMetadata;
  getOrmRepository: <T extends object>(entity: EntityClass<T>) => MongoEntityRepository<T>;
  beforeCompileModule?: (builder: TestingModuleBuilder) => Promise<void> | void;
  autoClose?: boolean;
  doNotMuteLogs?: boolean;
  defer: (callback: () => Promise<unknown> | unknown, after?: 'all' | 'step') => void;
  [key: string]: unknown;
}

export function createTestContext<TContext extends Partial<IInitialContext>, TDynamicContext>(
  ctx: TContext & {
    dynamicContext?: (ctx: IInitialContext) => Promise<TDynamicContext> | TDynamicContext;
  },
): TContext & IInitialContext & TDynamicContext {
  const deferredToAll: Array<() => Promise<unknown> | unknown> = [];
  const deferredToStep: Array<() => Promise<unknown> | unknown> = [];

  class TestAppConfigurator extends AppConfigurator {
    override startAsPersistentInstance(): Promise<void> {
      throw new Error('Not available in test context');
    }

    override async initApp() {
      await super.initApp();
      ctx.app = this.app;
      await this.app?.init();
    }

    protected override async createAppInstance(): Promise<NestExpressApplication> {
      const moduleBuilder = Test.createTestingModule(
        ctx.rootModuleDefinition ?? {
          imports: [AppModule],
        },
      );

      if (ctx.beforeCompileModule) {
        await ctx.beforeCompileModule(moduleBuilder);
      }

      ctx.module = await moduleBuilder.compile();

      return ctx.module.createNestApplication<NestExpressApplication>(this.getAppOptions());
    }

    public getApp(): NestExpressApplication {
      assert(this.app, 'App not initialized');
      return this.app;
    }
  }

  const configurator = new TestAppConfigurator();

  beforeAll(async () => {
    ctx.defer = (callback, after = 'all') => {
      if (after === 'all') {
        deferredToAll.push(callback);
      } else {
        deferredToStep.push(callback);
      }
    };

    if (!ctx.doNotMuteLogs) {
      loggerSingletonInstance.pause();
    }

    await configurator.initApp();
    ctx.app = configurator.getApp();
    ctx.agent = request.agent(ctx.app.getHttpServer());
    ctx.getOrmRepository = <T extends object>(entity: EntityClass<T>) =>
      ctx.app!.get(MikroORM).em.fork().getRepository(entity) as MongoEntityRepository<T>;

    if (ctx.dynamicContext) {
      Object.assign(ctx, await ctx.dynamicContext(ctx as IInitialContext));
    }
  });

  afterAll(async () => {
    for (const deferred of deferredToAll.reverse()) {
      await deferred();
    }

    if (ctx.app && ctx.autoClose !== false) {
      await configurator.stop();
    }
  });

  afterEach(async () => {
    for (const deferred of deferredToStep.reverse()) {
      await deferred();
    }
  });

  return ctx as TContext & IInitialContext & TDynamicContext;
}
