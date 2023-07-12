import {Entity, model, property} from '@loopback/repository';

@model()
export class Pegawai extends Entity {
  @property({
    type: 'string',
    id: true,
    mongodb: {dataType: 'ObjectId'}
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  nama_pegawai?: string;

  @property({
    type: 'number',
    required: true,
  })
  nomor_pegawai: number;


  constructor(data?: Partial<Pegawai>) {
    super(data);
  }
}

export interface PegawaiRelations {
  // describe navigational properties here
}

export type PegawaiWithRelations = Pegawai & PegawaiRelations;
