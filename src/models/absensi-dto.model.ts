import {Entity, model, property} from '@loopback/repository';

@model()
export class AbsensiDto extends Entity {
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

  constructor(data?: Partial<AbsensiDto>) {
    super(data);
  }
}

export interface AbsensiDtoRelations {
  // describe navigational properties here
}

export type AbsensiDtoWithRelations = AbsensiDto & AbsensiDtoRelations;
