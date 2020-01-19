const csv = require('csv-parser');
const fs = require('fs');
const moment = require('moment')
moment.locale('id')

module.exports = class List {
  constructor(config){
    this.config = config
    this.lists = {}
    this.tgl = {}
    this.moment = moment
  }

  getTgl() {
    for(let num of [ -1, 0 ]) {
      let now = moment()
      let e = moment().add(num, 'month')

      // console.log(e.format('DD-MM-YYYY'))
      let bln = e.format('MMMM')

      let blnNum = e.format('MM')

      let startOfMonth = e.clone().startOf('month')
      let endOfMonth = e.clone().endOf('month')
      let tglList = []
      let tglLength = 0

      // console.log(endOfMonth.isBefore(now))
      
      if (endOfMonth.isBefore(now)){
        now = endOfMonth.clone()
      }


      while (startOfMonth.isBefore(now)) {
        // console.log(startOfMonth.isBefore(now))
        // console.log(now.day())
        // console.log(now.day())
        if (now.day() !== 0) {
          tglList.push(now.format('DD MM YYYY'))
          tglLength++
        }
        now = now.clone().add(-1, 'day')
      }
      // now = endOfMonth
  
      if(bln === 'November'){
        bln = 'Nopember'
      }

      this.tgl[num] = {
        tglList,
        tglLength,
        tglSum: e.daysInMonth(),
        bln: bln.toUpperCase(),
        blnNum,
        thn: e.format('YYYY')
      }
    }
  }

  async getLists() {
    this.getTgl()
    await new Promise( resolve => fs.createReadStream('./all.csv')
    .pipe(csv({ separator: ';'}))
    .on('data', async (row) => {
      if(!this.lists[row.nama]){
        this.lists[row.nama] = row
      } 
    })
    .on('end', () => resolve()))
  }
}
