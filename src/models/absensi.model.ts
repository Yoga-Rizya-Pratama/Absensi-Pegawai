import {Entity, model, property} from '@loopback/repository';

@model()
export class Absensi extends Entity {
  @property({
    type: 'string',
    id: true,
    mongodb: {dataType: 'ObjectId'}
  })
  id?: number;

  @property({
    type: 'number',
    required: true,
  })
  nomor_pegawai: number;

  @property({
    type: 'string',
    required: true,
  })
  nama_pegawai: string;

  @property({
    type: 'date',
    required: true,
  })
  tanggal: string;

  @property({
    type: 'string',
    required: true,
  })
  waktu: string;

  @property({
    type: 'string',
    required: true,
  })
  tipe: string;

  @property({
    type: 'boolean',
    required: true,
    default: false,
  })
  telat: boolean;

  @property({
    type: 'date',
    default: () => new Date(),
  })
  createdAt?: Date;

  @property({
    type: 'date',
    default: () => new Date(),
  })
  updatedAt?: Date;

  constructor(data?: Partial<Absensi>) {
    super(data);
  }
}

export interface AbsensiRelations {
  // describe navigational properties here
}

export type AbsensiWithRelations = Absensi & AbsensiRelations;
