import {Entity, repository} from '@loopback/repository';
import {HttpErrors, del, get, param, patch, post, requestBody, response} from '@loopback/rest';
import {Absensi, AbsensiDto, IzinCuti, IzinCutiDto} from '../models';
import {AbsensiRepository, IzinCutiRepository, PegawaiRepository} from '../repositories';


export class AbsensiController {
  constructor(
    @repository(AbsensiRepository) protected absensiRepository: AbsensiRepository,
    @repository(PegawaiRepository) protected pegawaiRepository: PegawaiRepository,
    @repository(IzinCutiRepository) protected izinCutiRepository: IzinCutiRepository,
  ) { }

  @post('/absen/hadir')
  @response(201, {
    description: 'Kehadiran Pegawai',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              msg: {type: 'string'},
              status: {type: 'string'},
              data: {type: 'object'}
            },
          },
        },
      },
    },
  })
  async createAbsensi(@requestBody() absensi: AbsensiDto) {
    const now: Date = new Date();

    const findPegawai = await this.pegawaiRepository.findOne({where: {nomor_pegawai: absensi.nomor_pegawai}})

    const findKehadiran = await this.absensiRepository.findOne({where: {nomor_pegawai: absensi.nomor_pegawai, tanggal: now.toISOString().substring(0, 10)}})

    if (!findPegawai) throw HttpErrors.NotFound('Nomor Pegawai Tidak Ditemukan Harap Mendaftarkan Pegawai')
    if (findKehadiran) throw HttpErrors.BadRequest('Anda sudah hadir hari ini')

    // Tetapkan batas waktu terlambat pada jam 12:00 dan tanggal sesuai dengan waktu saat ini
    const batasWaktuTerlambat: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);

    const tipe: string = 'hadir'

    const data: Absensi & Entity = new Absensi();
    data.nomor_pegawai = absensi.nomor_pegawai;
    data.nama_pegawai = absensi.nama_pegawai;
    data.tipe = tipe;
    data.tanggal = now.toISOString().substring(0, 10); // Menggunakan tanggal saat ini
    data.waktu = now.toISOString(); // Menggunakan waktu saat ini

    // Periksa apakah waktu absensi melebihi batas waktu terlambat
    const waktuAbsensi: Date = new Date(data.waktu);

    if (waktuAbsensi > batasWaktuTerlambat) {
      data.telat = true;
    } else {
      data.telat = false;
    }
    const saveData = await this.absensiRepository.create(data)

    return {
      msg: 'kehadiran berhasil dibuat',
      status: data.telat ? 'telat, harap absen sebelum pukul 12.00 siang' : 'tepat waktu',
      data: saveData
    };
  }

  @post('/absen/izin')
  @response(201, {
    description: 'Data Pegawai Izin',
    content: {'application/json': {schema: IzinCuti}},
  })
  async createIzin(@requestBody() izin: IzinCutiDto) {
    const approval: boolean = false;
    const tipe: string = 'izin'

    const data: IzinCuti & Entity = new IzinCuti();
    data.nomor_pegawai = izin.nomor_pegawai;
    data.nama_pegawai = izin.nama_pegawai;
    data.tanggal = izin.tanggal;
    data.tipe = tipe;
    data.alasan = izin.alasan;
    data.approval = approval;

    return this.izinCutiRepository.create(data);
  }

  @post('/absen/cuti')
  @response(201, {
    description: 'Cuti Pegawai',
    content: {'application/json': {schema: IzinCuti}},
  })
  async createCuti(@requestBody() cuti: IzinCutiDto) {
    const approval: boolean = false;
    const tipe: string = 'cuti'

    const data: IzinCuti & Entity = new IzinCuti();
    data.nomor_pegawai = cuti.nomor_pegawai;
    data.nama_pegawai = cuti.nama_pegawai;
    data.tanggal = cuti.tanggal;
    data.tipe = tipe;
    data.alasan = cuti.alasan;
    data.approval = approval;

    return this.izinCutiRepository.create(data);
  }

  @get('/absen/hadir')
  @response(200, {
    description: 'Izin Pegawai',
    content: {'application/json': {schema: IzinCuti}},
  })
  async getKehadiran() {
    return this.absensiRepository.find()
  }

  @get('/absen/izin')
  @response(200, {
    description: 'Data Pegawai Izin',
    content: {'application/json': {schema: IzinCuti}},
  })
  async getIzin() {
    return this.izinCutiRepository.find({where: {tipe: 'izin'}})
  }

  @get('/absen/cuti')
  @response(200, {
    description: 'Data Pegawai Cuti',
    content: {'application/json': {schema: IzinCuti}},
  })
  async getCuti() {
    return this.izinCutiRepository.find({where: {tipe: 'cuti'}})
  }

  @patch('/approve/{id_izin}/izin')
  async approveIzin(@param.path.string('id_izin') id: number) {
    const izin = await this.izinCutiRepository.findOne({where: {id: id, tipe: 'izin'}});
    if (!izin) {
      throw HttpErrors.NotFound('izin not found');
    }
    izin.approval = true;
    try {
      const saveData = await this.izinCutiRepository.update(izin)
      const pegawai = await this.pegawaiRepository.findOne({where: {nomor_pegawai: izin.nomor_pegawai}});

      return {
        msg: `izin pegawai ${pegawai?.nama_pegawai} dengan nomor pegawai ${pegawai?.nomor_pegawai} berhasil disetujui`
      }

    } catch (error) {
      throw HttpErrors(error)
    }
  }

  @patch('/approve/{id_cuti}/cuti')
  async approveCuti(@param.path.string('id_cuti') id: number) {
    const cuti = await this.izinCutiRepository.findOne({where: {id: id, tipe: 'cuti'}});
    if (!cuti) {
      throw HttpErrors.NotFound('cuti not found');
    }
    cuti.approval = true;
    try {
      const saveData = await this.izinCutiRepository.update(cuti)
      const pegawai = await this.pegawaiRepository.findOne({where: {nomor_pegawai: cuti.nomor_pegawai}});

      return {
        msg: `cuti pegawai ${pegawai?.nama_pegawai} dengan nomor pegawai ${pegawai?.nomor_pegawai} berhasil disetujui`
      }

    } catch (error) {
      throw HttpErrors(error)
    }
  }

  @del('/absen/{id}/hadir')
  async deleteKehadiran(@param.path.string('id') id: number) {
    const findKehadiran = await this.absensiRepository.findById(id);

    if (!findKehadiran) throw HttpErrors.NotFound('Kehadiran Tidak Ditemukan')

    const del = await this.absensiRepository.deleteById(id);

    return {msg: 'kehadiran berhasil di hapus'}
  }

  @del('/absen/{id}/izin')
  async deleteIzin(@param.path.string('id') id: number) {
    const findIzin = await this.izinCutiRepository.findOne({
      where: {
        id: id,
        tipe: 'izin'
      }
    });

    if (!findIzin) throw HttpErrors.NotFound('Izin Tidak Ditemukan')

    const del = await this.izinCutiRepository.deleteById(id);

    return {msg: 'Izin berhasil di hapus'}
  }

  @del('/absen/{id}/cuti')
  async deleteCuti(@param.path.string('id') id: number) {
    const findIzin = await this.izinCutiRepository.findOne({
      where: {
        id: id,
        tipe: 'cuti'
      }
    });

    if (!findIzin) throw HttpErrors.NotFound('Cuti Tidak Ditemukan')

    const del = await this.izinCutiRepository.deleteById(id);

    return {msg: 'Cuti berhasil di hapus'}
  }


}
