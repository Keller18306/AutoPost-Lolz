import cookies, { cookieParser, saveCookies } from './cookies'
import input from './input'
import { lolzRequest } from './request'
import start from './poster'

init()

async function init() {
    if (Object.keys(cookies).length === 0) {
        Object.assign(cookies,
            cookieParser(await input('Cookies> '))
        )

        saveCookies()
    }

    start()
}