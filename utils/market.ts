import { lolzRequest } from "../request";
import parseHtml, { HTMLElement } from 'node-html-parser';
import { writeFileSync } from "fs";

export class Market {
    public balance: number = 0;
    public hold: number = 0;

    private myId?: number;
    private currentDate: Date;

    constructor() {
        this.currentDate = new Date()
    }

    private async getMyId(): Promise<number> {
        if (this.myId) return this.myId;

        const page = await lolzRequest('https://lolz.guru/market/') as string

        const html = parseHtml(page)

        let id: number | undefined;
        for (const item of html.querySelectorAll('div')) {
            if (item.classNames != 'marketSidebar') continue;

            let section: number = 0;
            for (const block of item.querySelectorAll('div')) {
                if (!block.classList.contains('section')) continue;

                section++
                if (section != 4) continue;

                for (const a of block.querySelectorAll('a')) {
                    const text = a.innerText.split('\n').join('').split('\t').join('')
                    if (text != 'Мои операции') continue;

                    const fid = a.getAttribute('href')?.split('/')[2]
                    if (fid) id = +fid

                    break;
                }

                for (const span of block.querySelectorAll('span')) {
                    if (span.classNames != 'balanceValue') continue;

                    this.balance = +span.innerText.split(' ').join('')

                    break;
                }

                for (const span of block.querySelectorAll('span')) {
                    if (span.classNames != 'balanceNumber muted') continue;
                    if (span.parentNode.classNames != 'fl_r') continue;

                    this.hold = +span.innerText.split(' ').join('')

                    break;
                }

                break;
            }

            break;
        }

        if (!id) throw new Error('can not get user id')
        this.myId = id

        return id
    }

    private async getXfToken(url: string): Promise<string> {
        const page = await lolzRequest(url) as string

        const html = parseHtml(page)

        let xftoken: string | undefined;
        for (const item of html.querySelectorAll('input')) {
            if (item.getAttribute('name') != '_xfToken') continue;

            xftoken = item.getAttribute('value')!

            break;
        }

        if (!xftoken) throw new Error('can not get _xfToken')

        return xftoken
    }

    getDate(_date?: Date): string {
        const date: Date = _date || this.currentDate
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}T` +
            `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}+` +
            `00:00`
    }

    private build_query(params: { [arg: string]: (number | boolean | string) }): string {
        return Object.keys(params)
            .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
            .join('&');
    }

    async call(args: { [arg: string]: (number | boolean | string) }): Promise<any> {
        const id = await this.getMyId()

        const xftoken = await this.getXfToken(`https://lolz.guru/market/user/${id}/payments`)

        const res = await lolzRequest(`https://lolz.guru/market/user/${id}/payments?` +
            this.build_query(Object.assign(args, {
                _xfResponseType: 'json',
                _xfToken: xftoken
            })),
            {
                asJson: true
            }
        )

        return res
    }

    async getTransfers(sender?: string, ignore?: string | number, noSent: boolean = true) {
        let total: number = 0;
        const transfers: {
            id: number,
            userId: number | string | null,
            userNick: string | null,
            amount: number,
            comment: string | undefined,
            time: number | string
        }[] = [];

        let pages: number = 1;
        for (let page = 1; page <= pages; page++) {
            const res = await this.call({
                type: 'money_transfer',
                ... (sender ? { sender: sender } : {}),
                startDate: '2017-09-05T00:00:00+00:00',
                endDate: this.getDate(),
                page: page
            })

            const html = parseHtml(res.templateHtml)

            if (page == 1) {
                let totalPages: number | undefined;
                for (const div of html.querySelectorAll('div')) {
                    if (div.classNames != 'PageNav') continue;
                    totalPages = +div.getAttribute('data-last')!
                    break;
                }
                if (!totalPages) throw new Error('can not get number of pages')

                pages = totalPages
            }

            let trdata: HTMLElement | undefined;
            for (const div of html.querySelectorAll('div')) {
                if (div.classNames != 'wrapper') continue;

                trdata = div

                break;
            }
            if (!trdata) throw new Error('can not get transactions list')

            for (const tr of trdata.querySelectorAll('div')) {
                if (!tr.classList.contains('item')) continue;

                let userId: number | string | null = null;
                for (const div of tr.querySelectorAll('div')) {
                    if (div.classNames != 'titleAction') continue;

                    const a = div.querySelector('a')
                    if (a == undefined) break;

                    const parts = a.getAttribute('href')!.split('/')

                    const id = parts[parts.length - 1 - 1]

                    userId = isNaN(+id) ? id : +id

                    break;
                }

                let userNick: string | undefined;
                for (const div of tr.querySelectorAll('div')) {
                    if (div.classNames != 'titleAction') continue;

                    const span = div.querySelector('span')
                    if (span == undefined) {
                        const text = div.innerText.split('\n').join('').split('\t').join('').replace(/\s+/g, ' ').trim()
                        const match = text.match(/перевод\ денег\ от\ ([\s\S]*)/i)?.[1]
                        if (match == null) break;
                        userNick = match
                        break;
                    }

                    userNick = span.innerText

                    break;
                }

                let amount: number | undefined;
                for (const div of tr.querySelectorAll('div')) {
                    if (div.classNames != 'amountChange') continue;

                    for (const span of div.querySelectorAll('span')) {
                        if (span.classNames != 'in') continue;
                        amount = +span.innerText.split(' ')[1].split('\n').join('').split('\t').join('')
                        break;
                    }

                    for (const span of div.querySelectorAll('span')) {
                        if (span.classNames != 'out') continue;
                        amount = -+span.innerText.split('\n').join('').split('\t').join('')
                        break;
                    }

                    break;
                }

                let comment: string | undefined;
                for (const div of tr.querySelectorAll('div')) {
                    if (div.classNames != 'muted comment') continue;

                    comment = div.innerText?.split('\n').join('').split('\t').join('').replace(/\s+/g, ' ').trim()

                    break;
                }

                let time: number | string | undefined;
                for (const abbr of tr.querySelectorAll('abbr')) {
                    if (abbr.classNames != 'DateTime muted') continue;

                    time = +abbr.getAttribute('data-time')!

                    break;
                }
                if (time == undefined) for (const abbr of tr.querySelectorAll('span')) {
                    if (abbr.classNames != 'DateTime muted') continue;

                    time = abbr.getAttribute('title')!

                    break;
                }

                if (
                    userNick == undefined ||
                    amount == undefined ||
                    time == undefined
                ) throw new Error('parse data error')

                if (userId == ignore) continue;
                if (noSent && amount < 0) continue;

                total += amount

                const transaction: {
                    id: number,
                    userId: number | string | null,
                    userNick: string | null,
                    amount: number,
                    comment: string | undefined,
                    time: number | string
                } = {
                    id: +tr.getAttribute('id')!.split('-')[1],
                    userId: userId,
                    userNick: userNick,
                    amount: amount,
                    comment: comment,
                    time: time
                }



                transfers.push(transaction)
            }
        }
        return {
            total: total,
            transfers: transfers
        }
    }
}

export function calcTopUsers(trs: {
    id: number,
    userId: number | string | null,
    userNick: string | null,
    amount: number,
    comment: string | undefined,
    time: number | string
}[], limit: number): { userId: number | string, userNick: string | null, total: number }[] {
    const users: Map<number | string, number> = new Map()
    const uName: Map<number | string, string | null> = new Map()

    for (const tr of trs) {
        if (tr.userId == null) continue;

        if (!users.has(tr.userId)) {
            users.set(tr.userId, 0)
            uName.set(tr.userId, tr.userNick)
        }

        users.set(tr.userId, users.get(tr.userId)! + tr.amount)
    }

    let summs: number[] = []
    for (const sum of users.values()) summs.push(sum)

    summs.sort(function (a, b) {
        return b - a;
    });

    summs = summs.splice(0, limit)

    summs = summs.filter((value, index, self) => { return self.indexOf(value) === index })

    const topUsers: { userId: number | string, userNick: string | null, total: number }[] = []

    for (const need of summs) {
        if (topUsers.length >= limit) break;
        for (const [id, sum] of users) {
            if (topUsers.length >= limit) break;
            if (sum != need) continue;

            topUsers.push({ userId: isNaN(+id) ? id : +id, userNick: uName.get(id)!, total: sum })
        }
    }

    return topUsers
}

export function formatUsersTop(users: { userId: number | string, userNick: string | null, total: number }[], parsedIds: { [id: string]: number }): string {
    const htmls: string[] = []

    for (const row of users) {
        const html = /*html*/`<p style="text-align: center">${(row.userId != null ? `[USER=${(isNaN(+row.userId) ? parsedIds[row.userId] : row.userId)}]${row.userNick}[/USER]` : row.userNick)} - ${row.total} ₽</p>`
        htmls.push(html)
    }

    return htmls.join('\n')
}

export function selectTop(trs: {
    id: number,
    userId: number | string | null,
    userNick: string | null,
    amount: number,
    comment: string | undefined,
    time: number | string
}[], limit: number): {
    id: number,
    userId: number | string | null,
    userNick: string | null,
    amount: number,
    comment: string | undefined,
    time: number | string
}[] {
    const summs: number[] = [];

    for (const tr of trs) if (!summs.includes(tr.amount)) summs.push(tr.amount)

    summs.sort(function (a, b) {
        return b - a;
    });

    const maxSumms = summs.splice(0, limit)

    const donats: {
        id: number,
        userId: number | string | null,
        userNick: string | null,
        amount: number,
        comment: string | undefined,
        time: number | string
    }[] = []

    for (const need of maxSumms) {
        for (const tr of trs) {
            if (donats.length > limit) break;
            if (tr.amount != need) continue;

            donats.push(tr)
        }
    }

    return donats
}

export function formatUsers(trs: {
    id: number,
    userId: number | string | null,
    userNick: string | null,
    amount: number,
    comment: string | undefined,
    time: number | string
}[], parsedIds: { [id: string]: number }) {
    const htmls: string[] = []

    for (const row of trs) {
        const html = /*html*/`<p style="text-align: center">${(row.userId != null ? (`[USER=${(isNaN(+row.userId) ? parsedIds[row.userId] : row.userId)}]${row.userNick}[/USER]`) : row.userNick)} - ${row.amount} ₽${row.comment != undefined ? ` - ${row.comment?.substr(0, 40)}${row.comment?.length > 40 ? '…' : ''}` : ''}</p>`
        htmls.push(html)
    }

    return htmls.join('\n')
}

export function formatContexts(trs: {
    id: number,
    userId: number | string | null,
    userNick: string | null,
    amount: number,
    comment: string | undefined,
    time: number | string
}[]) {
    const htmls: string[] = []

    for (const row of trs) {
        const html = /*html*/`<p style="text-align: center">${row.comment} - ${row.amount} ₽</p>`
        htmls.push(html)
    }

    return htmls.join('\n')
}

export async function getUserId(parseId: string): Promise<number> {
    const page = await lolzRequest(`https://lolz.guru/${parseId}/`) as string

    const html = parseHtml(page)

    let id: number | undefined;
    for (const div of html.querySelectorAll('div')) {
        if (div.classNames != 'mainProfileColumn') continue;

        for (const a of div.querySelectorAll('a')) {
            if (a.classNames != 'button') continue;

            const text = a.innerText.split('\t').join('').split('\n').join('')

            if (text != 'Аккаунты на маркете') continue;

            const parts = a.getAttribute('href')!.split('/')

            id = +parts[2]

            break;
        }

        break;
    }
    if (id == undefined) throw new Error(`can not get user id: ${parseId}`)

    return id;
}
