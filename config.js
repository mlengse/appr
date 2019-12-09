const {
  CHROME_PATH,
  USER_DATA_PATH,
} = process.env

module.exports = Object.assign({}, 
  process.env, 
  {
    pptrOpt: {
      headless: true,
      // headless: false,
      executablePath: CHROME_PATH, 
      userDataDir: USER_DATA_PATH,
      // args: ['--no-sandbox', '--disable-setuid-sandbox', '--auto-open-devtools-for-tabs' ]
    },
    waitOpt: {
      waitUntil: 'networkidle2'
    }
  })