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
      let bln = moment().add(num, 'month').format('MMMM')

      let blnNum = moment().add(num, 'month').format('MM')

      const startOfMonth = moment().add(num, 'month').startOf('month')
      let endOfMonth = moment().add(num, 'month').endOf('month')
      let tglList = []
      let tglLength = 0
      
      if (endOfMonth.isBefore(now)){
        now = endOfMonth
      }

      while (startOfMonth.isBefore(now)) {
        if (now.day() !== 0) {
          tglList.push(now.format('DD MM YYYY'))
          tglLength++
        }
        now = now.clone().add(-1, 'day')
      }
      now = endOfMonth
  
      if(bln === 'November'){
        bln = 'Nopember'
      }

      this.tgl[num] = {
        tglList,
        tglLength,
        tglSum: moment().daysInMonth(),
        bln: bln.toUpperCase(),
        blnNum,
        thn: moment().format('YYYY')
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
