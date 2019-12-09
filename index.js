const { schedule } = require('node-cron')
const runner = require('./runner')
schedule('20 18 * * *', async () => {
    try{
        await runner()
    }catch(err){
        console.log(err)
    } 
})