import parseHtml from 'node-html-parser';
import * as VM from 'vm'
import { getCookiesForHttp, setCookieHandler } from './cookies';
import { config } from './config';
import got from 'got'

export async function lolzRequest(
    url: string,
    options: {
        asJson?: boolean,
        emitAjax?: boolean,
        ajaxType?: 'thread' | 'page',
        referer?: string,
        headers?: { [header: string]: string },
        formData?: { [field: string]: (string | number | boolean) },
        xftoken?: string,
        ignoreJScheck?: boolean
    } = {
            asJson: false,
            emitAjax: false,
            headers: {},
            formData: {},
            ignoreJScheck: false
        }
): Promise<any> {
    const res = await got(url, {
        http2: true,
        method: options.emitAjax ? 'POST' : 'GET',
        headers: {
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,be;q=0.6',
            'cache-control': 'no-cache',
            'pragma': 'no-cache',
            'sec-ch-ua': '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'cross-site',
            'sec-fetch-user': '?1',
            'upgrade-insecure-requests': '1',
            'cookie': getCookiesForHttp(),
            'user-agent': config.ua,
            ...(options.emitAjax ? {
                'x-ajax-referer': options.referer,
                'x-requested-with': 'XMLHttpRequest',
            } : {}),
            ...(options.referer !== undefined ? {
                'referer': options.referer
            } : {}),
            'content-encoding': 'zlib',
            ...options.headers
        },
        ...(options.emitAjax ? {
            form: {
                ...options.formData,

                ...(options.ajaxType === 'thread' ? {
                    '_xfRequestUri': url.split('https://lolz.guru').join(''),
                    '_xfNoRedirect': 1,
                    '_xfResponseType': 'json'
                } : {}),

                ...(options.ajaxType === 'page' ? {
                    '_xfRelativeResolver': options.referer
                } : {}),

                '_xfToken': options.xftoken
            },
            followRedirect: false
        } : {})
    })

    const body = res.body


    /*if (err) {
        if (['ECONNRESET', 'ETIMEDOUT'].includes(err.code)) {
            await new Promise(res => setTimeout(res, 5e3))
            return lolzRequest(url, options).then(resolve, reject)
        }
        return reject(err);
    }*/
    if (res.headers['set-cookie'] !== undefined) setCookieHandler(res.headers['set-cookie'])
    if (![200, 303].includes(res.statusCode)) throw new Error(`status code: ${res.statusCode}`)
    if (!options.ignoreJScheck) {
        const html = parseHtml(body).querySelector('body')
        if (html !== null) {
            const noscript = html.querySelector('noscript')
            if (noscript !== null) {
                const htmlText = noscript.firstChild.innerText
                if (htmlText === '<p>Oops! Please enable JavaScript and Cookies in your browser.</p>') {
                    await getNewDfId(body)
                    return lolzRequest(url, options)
                }
            }
        }
    }
    if (res.statusCode === 200) {
        return (options.emitAjax || options.asJson ? JSON.parse(body) : body);
    } else {
        return {
            code: res.statusCode,
            redirect: res.headers.location
        }
    }
}

async function getNewDfId(text: string) {
    const DOM = parseHtml(text)
    const body = DOM.querySelector('body')
    const scripts = body.querySelectorAll('script')

    const parts = []
    for (const script of Array.from(scripts)) {
        if (script.getAttribute('src') === undefined) {
            parts.push(script.innerText)
        } else {
            const file = 'https://lolz.guru' + script.getAttribute('src')
            let src = await lolzRequest(file, { ignoreJScheck: true })
            parts.push(src)
        }
    }

    const src = parts.join('\n')

    const cookies: any[] = []

    const executer = new VM.Script(src)
    const context = {
        document: {
            set cookie(cookie: any) {
                cookies.push(cookie.split(';')[0])
            }
        },
        setTimeout: setTimeout,
        window: {
            atob: (text: any) => {
                return Buffer.from(text, 'base64').toString()
            },
            location: {
                href: undefined
            }
        },
        location: {
            reload: () => { },
            href: undefined
        }
    }
    await executer.runInNewContext(context, { timeout: 10000 })

    setCookieHandler(cookies)
}