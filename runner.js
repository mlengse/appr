require('dotenv').config()
const Ekin = require('./ekin')
const config = require('./config')

const ekin = new Ekin(config)

module.exports = async () => {
  try {
    await ekin.init()


    let lists = Object.keys(ekin.lists)
    let tgls = Object.keys(ekin.tgl).reverse()

    for( a of tgls) {
      for( nama of lists ) {
        console.log(nama)
	      if( a == 0 || 
	      	( a == -1 && 
	      		( (Number(ekin.moment().format('DD')) < 7 ) && 
              (
                nama === 'yuni' ||
                nama === 'anjang' ||
                nama === 'wagimin'
            )) ||
	      		( (Number(ekin.moment().format('DD')) < 3 ) && 
              (
                nama !== 'yuni' &&
	      			  nama !== 'anjang' &&
                nama !== 'wagimin'
            ))
          )) {
          await ekin.login(ekin.lists[nama])
    
          await ekin.getSatker()
    
          let dataBawahan = await ekin.getDataBawahan()

          let { tglLength, tglSum, bln, blnNum, thn } = ekin.tgl[a]

          let maxPoin = Math.round(8500*( a == 0 ? (tglLength < 20 ? (tglLength/tglSum) : 1 ) : 1 ))

          console.log(tglLength, tglSum, blnNum, thn, maxPoin)

          let tamsils = await ekin.getLaporanTamsil(blnNum, thn)

          for(tamsil of tamsils){
            let indexNIPs = dataBawahan.map(({NIP_18}) => NIP_18 )
            let existsIndex = indexNIPs.indexOf(tamsil[1])
            if(existsIndex > -1 && ((a == 0 && Number(parseFloat(tamsil[10])/100) < 1) || a == -1)) {
              dataBawahan[existsIndex] = Object.assign({}, dataBawahan[existsIndex], {
                tamsil,
                poin: Number(tamsil[9].split('POIN').join('').trim()),
                persen: Number(parseFloat(tamsil[10])/100)
              })

              let poin = dataBawahan[existsIndex].poin

              if(poin < maxPoin) {
                console.log(dataBawahan[existsIndex].tamsil.join('| '))
  
                let acts = await ekin.getLaporanRealisasi(dataBawahan[existsIndex].NIP_18, blnNum, thn)

                if(Object.keys(acts).length) {
                  acts = await ekin.getDataApprovalBawahan(acts, dataBawahan[existsIndex].NIP_18, bln)
                  acts = Object.keys(acts).map(e => acts[e])
                }
  
                while(Array.isArray(acts) && acts.length && poin < maxPoin) {
                  act = acts.shift()
                  if(act.poin && act.act){
                    act.res = await ekin.approve(act.act)
                    console.log(JSON.stringify(act))
                    poin += act.poin
                    console.log(poin)
    
                  }
                }
  
              }
        
            }
          }
          await ekin.logout()
        }
    
      }

    }

    await ekin.close()
  }catch(e){
    console.error(e)
  }
}