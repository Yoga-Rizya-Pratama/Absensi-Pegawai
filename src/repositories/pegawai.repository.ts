import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongoDsDataSource} from '../datasources';
import {Pegawai, PegawaiRelations} from '../models';

export class PegawaiRepository extends DefaultCrudRepository<
  Pegawai,
  typeof Pegawai.prototype.id,
  PegawaiRelations
> {
  constructor(
    @inject('datasources.mongoDS') dataSource: MongoDsDataSource,
  ) {
    super(Pegawai, dataSource);
  }
}
