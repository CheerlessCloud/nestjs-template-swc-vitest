import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { HealthChecksRepository } from './HealthCheck.entity.ts';
import { HealthCheck } from './HealthCheck.entity.ts';
import { EnsureRequestContext } from '@mikro-orm/core';
import { MongoEntityManager, ObjectId } from '@mikro-orm/mongodb';

@Injectable()
export class AppService {
  public constructor(
    @InjectRepository(HealthCheck)
    private readonly healthChecksRepository: HealthChecksRepository,
    @Inject(MongoEntityManager)
    private readonly em: MongoEntityManager,
  ) {}

  @EnsureRequestContext()
  async getStatus(): Promise<HealthCheck> {
    const entry = this.healthChecksRepository.create({
      _id: new ObjectId(),
      status: 'OK',
      createdAt: new Date(),
    });
    this.em.persistAndFlush(entry);

    return entry;
  }
}
