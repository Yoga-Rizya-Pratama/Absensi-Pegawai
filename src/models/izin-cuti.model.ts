import {Entity, model, property} from '@loopback/repository';

@model()
export class IzinCuti extends Entity {
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
  nama_pegawai: string;

  @property({
    type: 'number',
    required: true,
  })
  nomor_pegawai: number;

  @property({
    type: 'date',
    required: true,
  })
  tanggal: string;

  @property({
    type: 'string',
    required: true,
  })
  tipe: string;

  @property({
    type: 'string',
    required: true,
  })
  alasan: string;

  @property({
    type: 'boolean',
    required: true,
  })
  approval: boolean;

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

  constructor(data?: Partial<IzinCuti>) {
    super(data);
  }
}

export interface IzinCutiRelations {
  // describe navigational properties here
}

export type IzinCutiWithRelations = IzinCuti & IzinCutiRelations;
