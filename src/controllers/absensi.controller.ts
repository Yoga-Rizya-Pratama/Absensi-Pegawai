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

    // Ubah zona waktu ke Indonesia (GMT+7)
    const waktuIndonesia = new Date(now.toLocaleString('en-US', {timeZone: 'Asia/Jakarta'}));

    const findPegawai = await this.pegawaiRepository.findOne({where: {nomor_pegawai: absensi.nomor_pegawai}})
    const findKehadiran = await this.absensiRepository.findOne({where: {nomor_pegawai: absensi.nomor_pegawai, tanggal: waktuIndonesia.toISOString().substring(0, 10)}})
    if (!findPegawai) throw HttpErrors.NotFound('Nomor Pegawai Tidak Ditemukan Harap Mendaftarkan Pegawai')
    if (findKehadiran) throw HttpErrors.BadRequest('Anda sudah hadir hari ini')

    const tipe: string = 'hadir'

    const data: Absensi & Entity = new Absensi();
    data.nomor_pegawai = absensi.nomor_pegawai;
    data.nama_pegawai = absensi.nama_pegawai;
    data.tipe = tipe;
    data.tanggal = waktuIndonesia.toISOString().substring(0, 10); // Menggunakan tanggal saat ini
    data.waktu = waktuIndonesia.getHours().toString() + ':' + waktuIndonesia.getMinutes(); // Menggunakan waktu saat ini

    // Periksa apakah waktu absensi melebihi batas waktu terlambat
    const waktuAbsensi: Date = waktuIndonesia;
    if (waktuAbsensi.getHours() > 12 || (waktuAbsensi.getHours() === 12 && waktuAbsensi.getMinutes() > 0)) {
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
    const findPegawai = await this.pegawaiRepository.findOne({where: {nomor_pegawai: izin.nomor_pegawai}})
    if (!findPegawai) throw HttpErrors.NotFound('Nomor Pegawai Tidak Ditemukan Harap Mendaftarkan Pegawai')

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
    const findPegawai = await this.pegawaiRepository.findOne({where: {nomor_pegawai: cuti.nomor_pegawai}})
    if (!findPegawai) throw HttpErrors.NotFound('Nomor Pegawai Tidak Ditemukan Harap Mendaftarkan Pegawai')
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

  @get('/absen/laporan')
  @response(200, {
    description: 'Laporan Kehadiran Pegawai',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              nama_pegawai: {type: 'string'},
              nomor_pegawai: {type: 'number'},
              jumlah_telat: {type: 'number'},
              jumlah_izin: {type: 'number'},
              jumlah_cuti: {type: 'number'},
              jumlah_izin_sebulan: {
                type: 'object',
                properties: {
                  bulan: {type: 'string'},
                  izin_disetujui: {type: 'number'},
                  izin_tidak_disetujui: {type: 'number'},
                },
              },
              jumlah_cuti_sebulan: {
                type: 'object',
                properties: {
                  bulan: {type: 'string'},
                  cuti_disetujui: {type: 'number'},
                  cuti_tidak_disetujui: {type: 'number'},
                },
              },
            },
          },
        },
      },
    },
  })
  async getLaporan() {
    const now: Date = new Date();
    // Ubah zona waktu ke Indonesia (GMT+7)
    const waktuIndonesia = new Date(now.toLocaleString('en-US', {timeZone: 'Asia/Jakarta'}));

    const firstDayOfMonth = new Date(waktuIndonesia.getFullYear(), waktuIndonesia.getMonth(), 1).toISOString().substring(0, 10);
    const lastDayOfMonth = new Date(waktuIndonesia.getFullYear(), waktuIndonesia.getMonth() + 1, 0).toISOString().substring(0, 10);

    const findPegawai = await this.pegawaiRepository.find();

    const laporan = [];

    for (const pegawai of findPegawai) {
      const countTelat = await this.absensiRepository.find({where: {nomor_pegawai: pegawai.nomor_pegawai, telat: true}});
      const countIzin = await this.izinCutiRepository.find({where: {nomor_pegawai: pegawai.nomor_pegawai, tipe: 'izin'}});
      const countCuti = await this.izinCutiRepository.find({where: {nomor_pegawai: pegawai.nomor_pegawai, tipe: 'cuti'}});
      const countIzinDisetujui = await this.izinCutiRepository.count({
        nomor_pegawai: pegawai.nomor_pegawai,
        tanggal: {
          between: [firstDayOfMonth, lastDayOfMonth],
        },
        tipe: 'izin',
        approval: true,
      });
      const countIzinTidakDisetujui = await this.izinCutiRepository.count({
        nomor_pegawai: pegawai.nomor_pegawai,
        tanggal: {
          between: [firstDayOfMonth, lastDayOfMonth],
        },
        tipe: 'izin',
        approval: false,
      });
      const countCutiDisetujui = await this.izinCutiRepository.count({
        nomor_pegawai: pegawai.nomor_pegawai,
        tanggal: {
          between: [firstDayOfMonth, lastDayOfMonth],
        },
        tipe: 'cuti',
        approval: true,
      });
      const countCutiTidakDisetujui = await this.izinCutiRepository.count({
        nomor_pegawai: pegawai.nomor_pegawai,
        tanggal: {
          between: [firstDayOfMonth, lastDayOfMonth],
        },
        tipe: 'cuti',
        approval: false,
      });

      laporan.push({
        nama_pegawai: pegawai.nama_pegawai,
        nomor_pegawai: pegawai.nomor_pegawai,
        jumlah_telat: countTelat.length,
        jumlah_izin: countIzin.length,
        jumlah_cuti: countCuti.length,
        jumlah_izin_sebulan: {
          bulan: now.toLocaleString('default', {month: 'long'}),
          izin_disetujui: countIzinDisetujui.count,
          izin_tidak_disetujui: countIzinTidakDisetujui.count
        },
        jumlah_cuti_sebulan: {
          bulan: now.toLocaleString('default', {month: 'long'}),
          cuti_disetujui: countCutiDisetujui.count,
          cuti_tidak_disetujui: countCutiTidakDisetujui.count
        }
      });
    }

    return laporan;
  }

  @get('/absen/{no_pegawai}/laporan')
  @response(200, {
    description: 'Laporan Kehadiran Pegawai',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              nama_pegawai: {type: 'string'},
              nomor_pegawai: {type: 'number'},
              jumlah_telat: {type: 'number'},
              jumlah_izin: {type: 'number'},
              jumlah_cuti: {type: 'number'},
              jumlah_izin_sebulan: {
                type: 'object',
                properties: {
                  bulan: {type: 'string'},
                  izin_disetujui: {type: 'number'},
                  izin_tidak_disetujui: {type: 'number'},
                },
              },
              jumlah_cuti_sebulan: {
                type: 'object',
                properties: {
                  bulan: {type: 'string'},
                  cuti_disetujui: {type: 'number'},
                  cuti_tidak_disetujui: {type: 'number'},
                },
              },
            },
          },
        },
      },
    },
  })
  async getLaporanById(@param.path.string('no_pegawai') nomor_pegawai: number) {
    const pegawai = await this.pegawaiRepository.findOne({where: {nomor_pegawai: nomor_pegawai}});

    if (!pegawai) throw HttpErrors.NotFound('Pegawai not found')

    const now: Date = new Date();
    // Ubah zona waktu ke Indonesia (GMT+7)
    const waktuIndonesia = new Date(now.toLocaleString('en-US', {timeZone: 'Asia/Jakarta'}));

    const firstDayOfMonth = new Date(waktuIndonesia.getFullYear(), waktuIndonesia.getMonth(), 1).toISOString().substring(0, 10);
    const lastDayOfMonth = new Date(waktuIndonesia.getFullYear(), waktuIndonesia.getMonth() + 1, 0).toISOString().substring(0, 10);


    const countTelat = await this.absensiRepository.find({where: {nomor_pegawai: nomor_pegawai, telat: true}});
    const countIzin = await this.izinCutiRepository.find({where: {nomor_pegawai: nomor_pegawai, tipe: 'izin'}});
    const countCuti = await this.izinCutiRepository.find({where: {nomor_pegawai: nomor_pegawai, tipe: 'cuti'}});
    const countIzinDisetujui = await this.izinCutiRepository.count({
      nomor_pegawai: nomor_pegawai,
      tanggal: {
        between: [firstDayOfMonth, lastDayOfMonth],
      },
      tipe: 'izin',
      approval: true,
    });
    const countIzinTidakDisetujui = await this.izinCutiRepository.count({
      nomor_pegawai: nomor_pegawai,
      tanggal: {
        between: [firstDayOfMonth, lastDayOfMonth],
      },
      tipe: 'izin',
      approval: false,
    });
    const countCutiDisetujui = await this.izinCutiRepository.count({
      nomor_pegawai: nomor_pegawai,
      tanggal: {
        between: [firstDayOfMonth, lastDayOfMonth],
      },
      tipe: 'cuti',
      approval: true,
    });
    const countCutiTidakDisetujui = await this.izinCutiRepository.count({
      nomor_pegawai: nomor_pegawai,
      tanggal: {
        between: [firstDayOfMonth, lastDayOfMonth],
      },
      tipe: 'cuti',
      approval: false,
    });

    const laporan = {
      nama_pegawai: pegawai?.nama_pegawai,
      nomor_pegawai: pegawai?.nomor_pegawai,
      jumlah_telat: countTelat.length,
      jumlah_izin: countIzin.length,
      jumlah_cuti: countCuti.length,
      jumlah_izin_sebulan: {
        bulan: now.toLocaleString('default', {month: 'long'}),
        izin_disetujui: countIzinDisetujui.count,
        izin_tidak_disetujui: countIzinTidakDisetujui.count
      },
      jumlah_cuti_sebulan: {
        bulan: now.toLocaleString('default', {month: 'long'}),
        cuti_disetujui: countCutiDisetujui.count,
        cuti_tidak_disetujui: countCutiTidakDisetujui.count
      }
    };

    return laporan
  }
}
