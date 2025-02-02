import { Module } from '@nestjs/common';
import { AppController } from './app.controller.ts';
import { AppService } from './app.service.ts';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MongoDriver } from '@mikro-orm/mongodb';
import { HealthCheck } from './HealthCheck.entity.ts';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MikroOrmModule.forRoot({
      driver: MongoDriver,
      clientUrl: process.env.MONGODB_URI,
      autoLoadEntities: true,
      ensureIndexes: true,
      implicitTransactions: true,
    }),
    MikroOrmModule.forFeature([HealthCheck]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
