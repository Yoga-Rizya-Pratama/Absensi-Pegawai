import {Entity, repository} from '@loopback/repository';
import {HttpErrors, post, requestBody, response} from '@loopback/rest';
import {Absensi, AbsensiDto} from '../models';
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

}
