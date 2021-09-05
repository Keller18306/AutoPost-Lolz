//import { html } from 'lit-html'
import { time } from "./utils";

export default async function buildPost(): Promise<string> {
    return `
        <p style="text-align: center">Привет. Спасибо, что зашёл на мою страницу.</p>
        <p style="text-align: center">Я тот человек, кто убил целую расу ботов с автоучастием, сделав новую капчу. Мне очень
            жаль (нет)</p>
        <p style="text-align: center">Можешь высказаться мне в лс. Люблю всех, удачки! <img
                src="https://i.imgur.com/59gYEWE.png" class="mceSmilie" alt=":animelove:" unselectable="on"></p>
        <p style="text-align: center"><img src="https://i.imgur.com/wx2vdeG.png" class="bbCodeImage wysiwygImage" alt=""
                unselectable="on"></p>
        <p style="text-align: center">Это техас, она же у меня на аве <img src="https://i.imgur.com/DQLW02K.png"
                class="mceSmilie" alt=":animecute:" unselectable="on">:</p>
        <p style="text-align: center"><img src="https://i.imgur.com/lq4iFfi.gif" class="bbCodeImage wysiwygImage" alt=""
                unselectable="on"></p>
        <p style="text-align: center"><img src="https://i.imgur.com/wx2vdeG.png" class="bbCodeImage wysiwygImage" alt=""
                unselectable="on"></p>
        <p style="text-align: center">Топ донатеры:</p>
        <p style="text-align: center"><img src="https://i.imgur.com/wx2vdeG.png" class="bbCodeImage wysiwygImage" alt=""
                unselectable="on"></p>
        <p style="text-align: center">Последние 10 донатов:</p>
        <p style="text-align: center"><img src="https://i.imgur.com/wx2vdeG.png" class="bbCodeImage wysiwygImage" alt=""
                unselectable="on"></p>
        <p style="text-align: center">Всего получено с розыгрышей: 0 ₽</p>
        <p style="text-align: center">Всего задонатили: 0 ₽</p>
        <p style="text-align: center">Текущий баланс: 0 ₽</p>
        <p style="text-align: center"><img src="https://i.imgur.com/wx2vdeG.png" class="bbCodeImage wysiwygImage" alt=""
                unselectable="on"></p>
        <p style="text-align: right">Актуально на: ${time()}</p>
    `
}