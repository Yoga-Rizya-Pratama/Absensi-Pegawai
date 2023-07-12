import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongoDsDataSource} from '../datasources';
import {Absensi, AbsensiRelations} from '../models';

export class AbsensiRepository extends DefaultCrudRepository<
  Absensi,
  typeof Absensi.prototype.id,
  AbsensiRelations
> {
  constructor(
    @inject('datasources.mongoDS') dataSource: MongoDsDataSource,
  ) {
    super(Absensi, dataSource);
  }
}
