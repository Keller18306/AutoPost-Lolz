import { config } from "./config";
import { time } from "./utils/";
import { calcTopUsers, formatContexts, formatUsers, formatUsersTop, getUserId, Market, selectTop } from "./utils/market";

export default async function buildPost(): Promise<string> {
        const market = new Market()

        const [contexts, donats] = await Promise.all([
                market.getTransfers('root'),
                market.getTransfers(undefined, 3)
        ])

        const toParseIds: string[] = []

        const topDonators = calcTopUsers(donats.transfers, config.limits.topDonaters)
        const topDonats = selectTop(donats.transfers, config.limits.topDonats)
        const lastDonats = donats.transfers.splice(0, config.limits.lastDonats)

        for (const row of topDonators) {
                if (typeof row.userId != 'string') continue;
                if (toParseIds.includes(row.userId)) continue;
                toParseIds.push(row.userId)
        }

        for (const row of topDonats) {
                if (typeof row.userId != 'string') continue;
                if (toParseIds.includes(row.userId)) continue;
                toParseIds.push(row.userId)
        }

        for (const row of lastDonats) {
                if (typeof row.userId != 'string') continue;
                if (toParseIds.includes(row.userId)) continue;
                toParseIds.push(row.userId)
        }

        const parsedIds: { [id: string]: number } = {}
        for (const parseId of toParseIds) {
                parsedIds[parseId] = await getUserId(parseId)
        }

        return /*html*/`
        <p style="text-align: center">Привет. Спасибо, что зашёл на мою страницу.</p>
        <p style="text-align: center">Я тот человек, кто убил целую расу ботов с автоучастием, сделав новую капчу. Мне очень
                жаль (нет)</p>
        <p style="text-align: center">Можешь высказаться мне в лс. Люблю всех, удачки! <img src="https://i.imgur.com/59gYEWE.png" class="mceSmilie" alt=":animelove:" unselectable="on"></p>
        <p style="text-align: center"><img src="https://i.imgur.com/wx2vdeG.png" class="bbCodeImage wysiwygImage" alt="" unselectable="on"></p>
        <p style="text-align: center"><img src="https://i.imgur.com/IgUqRlw.png" title="Tg" alt=":tg:" data-smilie="yes">&nbsp;</p>
        <p style="text-align: center">Мой телеграм канал: <a href="https://t.me/kellorium" target="_blank" class="externalLink ProxyLink" data-proxy-href="https://t.me/kellorium" rel="nofollow noopener">https://t.me/kellorium</a></p>
        <p style="text-align: center">(заходи, там очень много интересной инфы)</p>
        <p style="text-align: center"><br></p>
        <p style="text-align: center"><img src="https://i.imgur.com/wx2vdeG.png" class="bbCodeImage wysiwygImage" alt="" unselectable="on"></p>
        <p style="text-align: center">Это техас, она же у меня на аве <img src="https://i.imgur.com/DQLW02K.png" class="mceSmilie" alt=":animecute:" unselectable="on">:</p>
        <p style="text-align: center"><img src="https://i.imgur.com/lq4iFfi.gif" class="bbCodeImage wysiwygImage" alt="" unselectable="on"></p>
        <p style="text-align: center"><img src="https://i.imgur.com/wx2vdeG.png" class="bbCodeImage wysiwygImage" alt="" unselectable="on"></p>
        <p style="text-align: center">Топ ${config.limits.topDonaters} донатеров:</p>
        <p style="text-align: center"><br></p>
        ${formatUsersTop(topDonators, parsedIds)}
        <p style="text-align: center"><img src="https://i.imgur.com/wx2vdeG.png" class="bbCodeImage wysiwygImage" alt="" unselectable="on"></p>
        <p style="text-align: center">Топ ${config.limits.topDonats} донатов:</p>
        <p style="text-align: center"><br></p>
        ${formatUsers(topDonats, parsedIds)}
        <p style="text-align: center"><img src="https://i.imgur.com/wx2vdeG.png" class="bbCodeImage wysiwygImage" alt="" unselectable="on"></p>
        <p style="text-align: center">Последние ${config.limits.lastDonats} донатов:</p>
        <p style="text-align: center"><br></p>
        ${formatUsers(lastDonats, parsedIds)}
        <p style="text-align: center"><img src="https://i.imgur.com/wx2vdeG.png" class="bbCodeImage wysiwygImage" alt="" unselectable="on"></p>
        <p style="text-align: center">Последние ${config.limits.contexts} побед в розыгрышах:</p>
        <p style="text-align: center"><br></p>
        ${formatContexts(contexts.transfers.splice(0, config.limits.contexts))}
        <p style="text-align: center"><img src="https://i.imgur.com/wx2vdeG.png" class="bbCodeImage wysiwygImage" alt="" unselectable="on"></p>
        <p style="text-align: center">Всего получено с розыгрышей: ${contexts.total} ₽</p>
        <p style="text-align: center">Всего задонатили: ${donats.total} ₽</p>
        <p style="text-align: center">Текущий баланс: ${market.balance} ₽</p>
        <p style="text-align: center">В холде: ${market.hold} ₽</p>
        <p style="text-align: center"><img src="https://i.imgur.com/wx2vdeG.png" class="bbCodeImage wysiwygImage" alt="" unselectable="on"></p>
        <p style="text-align: right">Актуально на: ${time()}</p>
        <p style="text-align: center"><br></p>
        <p style="text-align: left">Разработчик: <a href="https://lolz.guru/keller" class="internalLink ProxyLink" data-proxy-href="https://lolz.guru/keller">https://lolz.guru/keller</a></p>
        <p style="text-align: left">Исходный код: <a href="https://github.com/Keller18306/AutoPost-Lolz" target="_blank" class="externalLink ProxyLink" data-proxy-href="https://github.com/Keller18306/AutoPost-Lolz" rel="nofollow noopener">https://github.com/Keller18306/AutoPost-Lolz</a></p>
    `
}
