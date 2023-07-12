import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongoDsDataSource} from '../datasources';
import {IzinCuti, IzinCutiRelations} from '../models';

export class IzinCutiRepository extends DefaultCrudRepository<
  IzinCuti,
  typeof IzinCuti.prototype.id,
  IzinCutiRelations
> {
  constructor(
    @inject('datasources.mongoDS') dataSource: MongoDsDataSource,
  ) {
    super(IzinCuti, dataSource);
  }
}
