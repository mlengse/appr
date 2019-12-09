const pptr = require('puppeteer-core')
const List = require('./list')

module.exports = class Core extends List {
  constructor(config) {
    super(config)
  }

  async logout(){
		await this.page.evaluate(async () => await fetch('/e-kinerja/v1/login/logout'))
  }

  async close(){
    await this.browser.close()
  }

  async login(user){
    await this.logout()
    if(user){
      this.user = user
    }
    this.isLogin = await this.page.evaluate(() => localStorage.getItem("status_login"))
		if(!this.isLogin) {
			let res = await this.page.evaluate(async user => {
				let getParams = obj => Object.entries(obj).map(([key, val]) => `${key}=${val}`).join('&')
				let response = await fetch('/e-kinerja/v1/login/cek_login', {
					method: 'POST',
					headers: {
						"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",                                                                                                
				 	},
					credentials: 'same-origin',
					body: getParams({
            USERNAME: user.username,
            PASSWORD: user.password
					}),
				})
				return await response.json()
			}, this.user)
			this.isLogin = res.status
		}

  }

  async init(){
    this.browser = await pptr.launch(this.config.pptrOpt);
    this.pages = await this.browser.pages()
    this.page = this.pages[0]
    await Promise.all([
      this.page.goto(this.config.EKIN_URL, this.waitOpt),
      this.getLists()
    ])
  }

}