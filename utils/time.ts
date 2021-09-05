export function time(microtime: boolean = false): string {
    const date = new Date()

    return `${date.getDate().toString().padStart(2, '0')}.` +
        `${(date.getMonth() + 1).toString().padStart(2, '0')}.` +
        `${date.getFullYear()} ` +
        `${date.getHours().toString().padStart(2, '0')}:` +
        `${date.getMinutes().toString().padStart(2, '0')}:` +
        `${date.getSeconds().toString().padStart(2, '0')}` +
        (microtime ? `,${date.getMilliseconds().toString().padStart(3, '0')}` : '')
}