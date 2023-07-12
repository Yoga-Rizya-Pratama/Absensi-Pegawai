import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {Pegawai} from '../models';
import {PegawaiRepository} from '../repositories';

export class PegawaiController {
  constructor(
    @repository(PegawaiRepository)
    public pegawaiRepository: PegawaiRepository,
  ) { }

  @post('/pegawai')
  @response(200, {
    description: 'Pegawai model instance',
    content: {'application/json': {schema: getModelSchemaRef(Pegawai)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Pegawai, {
            title: 'NewPegawai',
            exclude: ['id'],
          }),
        },
      },
    })
    pegawai: Omit<Pegawai, 'id'>,
  ): Promise<Pegawai> {
    return this.pegawaiRepository.create(pegawai);
  }

  @get('/pegawai/count')
  @response(200, {
    description: 'Pegawai model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Pegawai) where?: Where<Pegawai>,
  ): Promise<Count> {
    return this.pegawaiRepository.count(where);
  }

  @get('/pegawai')
  @response(200, {
    description: 'Array of Pegawai model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Pegawai, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Pegawai) filter?: Filter<Pegawai>,
  ): Promise<Pegawai[]> {
    return this.pegawaiRepository.find(filter);
  }

  @patch('/pegawai')
  @response(200, {
    description: 'Pegawai PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Pegawai, {partial: true}),
        },
      },
    })
    pegawai: Pegawai,
    @param.where(Pegawai) where?: Where<Pegawai>,
  ): Promise<Count> {
    return this.pegawaiRepository.updateAll(pegawai, where);
  }

  @get('/pegawai/{id}')
  @response(200, {
    description: 'Pegawai model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Pegawai, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Pegawai, {exclude: 'where'}) filter?: FilterExcludingWhere<Pegawai>
  ): Promise<Pegawai> {
    return this.pegawaiRepository.findById(id, filter);
  }

  @patch('/pegawai/{id}')
  @response(204, {
    description: 'Pegawai PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Pegawai, {partial: true}),
        },
      },
    })
    pegawai: Pegawai,
  ): Promise<void> {
    await this.pegawaiRepository.updateById(id, pegawai);
  }

  @put('/pegawai/{id}')
  @response(204, {
    description: 'Pegawai PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() pegawai: Pegawai,
  ): Promise<void> {
    await this.pegawaiRepository.replaceById(id, pegawai);
  }

  @del('/pegawai/{id}')
  @response(204, {
    description: 'Pegawai DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.pegawaiRepository.deleteById(id);
  }
}
