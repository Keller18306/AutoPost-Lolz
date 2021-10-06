import { lolzRequest } from './request'
import buildPost from './post'
import { config } from './config'
import parseHtml from 'node-html-parser';
import { time } from './utils/';

export default async function start() {
    while (true) {
        const startTime = new Date().getTime()

        try {
            await new Promise<void>(async (res, rej) => {
                const timeout = setTimeout(() => {
                    rej(new Error('timed out'))
                }, 5 * 60 * 1e3)

                await handleAction().catch(rej)

                clearTimeout(timeout)
                res()
            })

			console.log(`[${time(true)}]: Updated`)
		} catch(e: any) {
			console.error(time(true), e)
		}
        
        await new Promise(res => setTimeout(res, config.update * 1e3 - (new Date().getTime() - startTime)))
    }
}

async function handleAction() {
    const html = await buildPost()

    const xftoken: string = await getXfToken(`https://lolz.guru/profile-posts/${config.postId}/edit`)

    const response = await lolzRequest(`https://lolz.guru/profile-posts/${config.postId}/save`, {
        emitAjax: true,
        ajaxType: 'page',
        referer: `https://lolz.guru/profile-posts/${config.postId}/edit`,
        formData: {
            message_html: html
        },
        xftoken: xftoken
    }) as any

    if(response.code !== 303) throw new Error(`status code is ${response.code}`)

    return true
}

async function getXfToken(url: string): Promise<string> {
    const page = await lolzRequest(url) as string

    const html = parseHtml(page)

    let xftoken;
    for (const item of html.querySelectorAll('input')) {
        if (item.getAttribute('name') !== '_xfToken') continue;

        xftoken = item.getAttribute('value')

        break;
    }
    if(xftoken === undefined) throw new Error('can not get xftoken')

    return xftoken
}