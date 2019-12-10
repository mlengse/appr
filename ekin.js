const Core = require('./core')

module.exports = class Ekin extends Core {
  constructor(config) {
    super(config)
  }

  async getLaporanRealisasi(nip, blnNum, thn) {
    return await this.page.evaluate(async(NIP, KD_BULAN, KD_TAHUN) => {
      let getParams = obj => Object.entries(obj).map(([key, val]) => `${key}=${val}`).join('&')
      let acts = {}
      let wrapper = document.querySelector('div')

      let post = {
        method: 'POST',
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",                                                                                                
        },
        credentials: 'same-origin',
        body: getParams({
          NIP, 
          KD_BULAN, 
          KD_TAHUN        
        }),
      }

      let [ response, response2 ] = await Promise.all([
        fetch('/e-kinerja/v1/laporan_realisasi/tabel_laporan_realisasi', post),
        fetch('/e-kinerja/v1/laporan_realisasi/tabel_laporan_tambahan', post)
      ])

      wrapper.insertAdjacentHTML('afterend', await response.text())
      wrapper.insertAdjacentHTML('afterend', await response2.text())
  
      let table = document.getElementById('tabel_d_realisasi_kegiatan').querySelectorAll('tr')
      let table2 = document.getElementById('tabel_laporan_tambahan').querySelectorAll('tr')
      let rows = [...table, ...table2]
      for (row of rows) {
        let text = []
        let keg = {
          // text: [],
        }
  
        let tds = row.querySelectorAll('td')
  
        for (let col of tds) {
          text.push(col.textContent.split('\n').join('').split('  ').join(''))
        }
  
        keg = Object.assign({}, keg, {
          kode: text[0],
          nama: text[1],
          tgl: text[2],
          kuantitas: text[3],
          poin: Number(text[4]),
          stat: text[5],
        })
        if(keg.stat && keg.stat.toLowerCase().includes('belum')){
          acts[keg.kode] = keg
        }
  
      }
      return acts
  
    }, nip, blnNum, thn)

  }

  async approve(act){
    return await this.page.evaluate( async act => {
      let getParams = obj => Object.entries(obj).map(([key, val]) => `${key}=${val}`).join('&')
      let appr = {
        STATUS: 'S'
      }
      function klik_data_d_approve_kegiatan_tambahan(NIP,KD_KEGIATAN_TAMBAHAN,NM_KEGIATAN,KD_AKTIVITAS,NM_AKTIVITAS,POIN,TGL_KEGIATAN_TAMBAHAN,KD_TAHUN,KD_BULAN,JAM_MULAI,JAM_SELESAI,NM_BULAN,PEMBERI_TUGAS,KUANTITAS,STATUS,STATUS_REVISI,BIAYA,KETERANGAN,NIP_APPROVE,TGL_APPROVE,NM_STATUS_APPROVE,CATATAN){
        appr = Object.assign({}, appr, {
          KD_KEGIATAN_TAMBAHAN,
          PEMBERI_TUGAS,
          NM_KEGIATAN,
          KD_AKTIVITAS,
          TGL_KEGIATAN_TAMBAHAN,
          JAM_MULAI,
          JAM_SELESAI,
          KUANTITAS,
          BIAYA,
          KETERANGAN,
          // STATUS,
          CATATAN
        })
      }
      function klik_data_d_approve_realisasi_kegiatan(KD_TAHUN,KD_KEGIATAN_TAHUN,NM_KEGIATAN_TAHUN,KD_BULAN,NM_BULAN,KD_KEGIATAN_BULAN,NM_KEGIATAN_BULAN,KD_REALISASI_KEGIATAN,NM_KEGIATAN,NIP,KD_AKTIVITAS,NM_AKTIVITAS,TGL_REALISASI,JAM_MULAI, JAM_SELESAI,KUANTITAS,STATUS,STATUS_REVISI,BIAYA,KETERANGAN){
        appr = Object.assign({}, appr, {
          KD_KEGIATAN_BULAN,
          NM_KEGIATAN_BULAN,
          KD_REALISASI_KEGIATAN,
          NM_KEGIATAN,
          NM_AKTIVITAS,
          KUANTITAS,
          TGL_REALISASI,
          JAM_MULAI,
          JAM_SELESAI,
          BIAYA,
          KETERANGAN
        })
        // tampil_rupiah();
      }

      async function simpan(url){
        let response = await fetch(`/e-kinerja/v1/${url}/simpan`, {
          method: 'POST',
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",                                                                                                
           },
          credentials: 'same-origin',
          body: getParams(appr),
        })
        return await response.json()
      }

      eval(act)

      if(act.includes('klik_data_d_approve_realisasi_kegiatan')){
        return await simpan('d_approve_realisasi_kegiatan')
      } else {
        return await simpan('d_approve_kegiatan_tambahan')
      }

    }, act)
  }

  async getDataApprovalBawahan(acts, nip, bln){
    return await this.page.evaluate(async (acts, NIP_BAWAHAN, bulan) => {

      // let actsList = Object.keys(acts).map( ({kode})=>kode)
      let getParams = obj => Object.entries(obj).map(([key, val]) => `${key}=${val}`).join('&')
      let wrapper = document.querySelector('div')
      let post = {
        method: 'POST',
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",                                                                                                
         },
        credentials: 'same-origin',
        body: getParams({
          NIP_BAWAHAN
        }),
      }
      let [response, response2 ] = await Promise.all([
        fetch('/e-kinerja/v1/d_approve_realisasi_kegiatan/tabel_d_approve_realisasi_kegiatan', post),
        fetch('/e-kinerja/v1/d_approve_kegiatan_tambahan/tabel_d_approve_kegiatan_tambahan', post)
      ])

      let [ text, text2] = await Promise.all([
        response.text(),
        response2.text()
      ])

      wrapper.insertAdjacentHTML('afterend', text )
      wrapper.insertAdjacentHTML('afterend', text2 )

      let table = document.getElementById('tabel_d_approve_realisasi_kegiatan')
      if( table ) {
        table = table.querySelectorAll('tr')
      } else {
        table = []
      }
      let table2 = document.getElementById('tabel_d_approve_kegiatan_tambahan')
      if(table2){
        table2 = table2.querySelectorAll('tr')
      } else {
        table2 = []
      }

      let rows = [...table, ...table2]
      for (row of rows) {
        let texts = []
        let act = row.getAttribute('ondblclick')
        let keg = {
          // act: row.getAttribute('ondblclick'),
          // texts: [],
          bulan: '',
          // keg: '',
          // jml: '',
        }

        let tds = row.querySelectorAll('td')

        for (let col of tds) {
          texts.push(col.textContent.split('\n').join('').split('  ').join(''))
        }

        keg.bulan = texts[0]
        // keg.keg = keg.text[1]
        // keg.jml = keg.text[2]
        keg.stat = texts[3]
        if(act && keg.stat.toLowerCase().includes('belum') && keg.bulan === bulan){
          act = act.split('\n')
          keg.kode = act[8].split("'").join('').split(",").join('').trim()
          // act.shift()
          // act.pop()
          // keg.act = act.map(e => e.split("'").join('').split(",").join('').trim())
          keg.act = act.map(e=>e.trim()).join('')
          if(acts[keg.kode]){
            acts[keg.kode] = Object.assign({}, acts[keg.kode], keg)
          } 
          else {
            acts[keg.kode] = keg
          }
        }

      }
      return acts

    }, acts, nip, bln )

  }

  async getLaporanTamsil(blnNum, thn){
    this.lists[this.user.nama].tamsil = await this.page.evaluate(async (KD_SATKER, KD_BULAN, KD_TAHUN) => {
      let getParams = obj => Object.entries(obj).map(([key, val]) => `${key}=${val}`).join('&')
      let response = await fetch('/e-kinerja/v1/laporan_realisasi_pegawai/tabel_laporan_tamsil', {
        method: 'POST',
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",                                                                                                
         },
        credentials: 'same-origin',
        body: getParams({
          // KD_SATKER_INDUK: $('KD_SATKER_INDUK').val(), 
          KD_SATKER,
          KD_BULAN, 
          KD_TAHUN
        }),
      })
      let wrapper = document.querySelector('div')
      wrapper.insertAdjacentHTML('afterend', await response.text())
      let table = document.getElementById('tabel_laporan_tamsil')
      let rows = table.querySelectorAll('tr')
      let acts = []
      for (row of rows) {
        let r = []
        let tds = row.querySelectorAll('td')
        for(let td of tds) {
          r.push(td.textContent)
        }
        acts.push(r)
      }
      // return dataBawahan
      return acts
    }, this.satker, blnNum.toString(), thn)

    return this.lists[this.user.nama].tamsil
  }

  async getSatker() {
    this.satker = await this.page.evaluate(async ()=> {
      let response = await fetch('/e-kinerja/v1/laporan_realisasi_pegawai', {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",                                                                                                
         },
        credentials: 'same-origin',
      })

      let wrapper = document.querySelector('div')
      wrapper.insertAdjacentHTML('afterend', await response.text())

      return document.getElementById('KD_SATKER').value
    })
    return this.satker
  }

  async getDataBawahan(){
    this.lists[this.user.nama].dataBawahan = await this.page.evaluate(async() => {
			let response = await fetch('/e-kinerja/v1/layout/data_bawahan', {
				method: 'POST',
				headers: {
					"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",                                                                                                
				 },
				credentials: 'same-origin',
			})
      let res = await response.json()
      return res.data
    })
    
    return this.lists[this.user.nama].dataBawahan 

  }

}