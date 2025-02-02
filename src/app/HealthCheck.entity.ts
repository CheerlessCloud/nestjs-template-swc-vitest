import { Property, SerializedPrimaryKey, PrimaryKey, EntityRepositoryType } from '@mikro-orm/core';
import { ObjectId, Entity, EntityRepository } from '@mikro-orm/mongodb';

@Entity({ collection: 'health-checks', repository: () => HealthChecksRepository })
export class HealthCheck {
  [EntityRepositoryType]?: HealthChecksRepository;

  @PrimaryKey({ type: ObjectId })
  _id!: ObjectId;

  @SerializedPrimaryKey({ type: String })
  id!: string;

  @Property({ type: Date })
  createdAt!: Date;

  @Property({ type: String })
  status!: string;
}

export class HealthChecksRepository extends EntityRepository<HealthCheck> {}
