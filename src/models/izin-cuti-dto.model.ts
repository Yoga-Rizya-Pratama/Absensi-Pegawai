import {Entity, model, property} from '@loopback/repository';

@model()
export class IzinCutiDto extends Entity {
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
  alasan: string;


  constructor(data?: Partial<IzinCutiDto>) {
    super(data);
  }
}

export interface IzinCutiDtoRelations {
  // describe navigational properties here
}

export type IzinCutiDtoWithRelations = IzinCutiDto & IzinCutiDtoRelations;
