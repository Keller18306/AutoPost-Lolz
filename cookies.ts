import { existsSync, readFileSync, writeFileSync } from "fs"

export type Cookies = { [cookie: string]: string }

const loadedCookies: Cookies = loadCookies();

export function cookieParser(cookieLine: string): Cookies {
    const listCookies = cookieLine.split('; ')
    const cookies: Cookies = {}
    for (const line of listCookies) {
        const data = line.split('=')
        cookies[data[0]] = data[1]
    }
    return cookies
}

export function cookieEncoder(cookies: Cookies): string {
    const cookiesList = []
    for (const cookie in cookies) {
        cookiesList.push([cookie, cookies[cookie]].join('='))
    }
    return cookiesList.join('; ')
}

function headerCookieDecoder(cookies: Cookies, cookie: string) {
    cookie = cookie.split('; ')[0]
    const parts = cookie.split('=')
    cookies[parts[0]] = parts[1]
}

export function setCookieHandler(array: string[]) {
    const cookies = {}
    for (const cookie of array) headerCookieDecoder(cookies, cookie)
    Object.assign(loadedCookies, cookies)
    saveCookies()
}

export function sortCookies(cookies: Cookies): void {
    for (const cookie in cookies) {
        if (
            !cookie.startsWith('_ym') &&
            !cookie.startsWith('_ga') &&
            !['G_ENABLED_IDPS', 'xf_viewedContestsHidden'].includes(cookie)
        ) continue;
        delete cookies[cookie]
    }
}

export function formatCookiesForHttp(cookies: Cookies): string {
    sortCookies(cookies)
    const cookiesList = []
    for (const cookie in cookies) {
        cookiesList.push([cookie, cookies[cookie]].join('='))
    }
    //cookiesList.push(['xf_viewedContestsHidden', config.checkAllPages ? '0' : '1'].join('='))
    return cookiesList.join('; ')
}

export function getCookiesForHttp(): string {
    return formatCookiesForHttp(loadedCookies)
}

export function saveCookies(): void {
    sortCookies(loadedCookies)

    writeFileSync(
        './session.json',
        JSON.stringify(loadedCookies, null, 4)
    )
}

export function loadCookies(): Cookies {
    if (!existsSync('./session.json')) writeFileSync('./session.json', JSON.stringify({}))

    const raw = readFileSync('./session.json').toString()

    const json: Cookies = JSON.parse(raw)

    sortCookies(json)

    return json
}

export { loadedCookies as cookies }

export default loadedCookies