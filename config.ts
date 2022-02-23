export const config: {
    ua: string,
    postId: number,
    update: number,
    limits: {
        topDonaters: number,
        topDonats: number,
        lastDonats: number,
        contexts: number
    }
} = {
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36',
    postId: 1636165,
    update: 900, //15 min
    limits: {
        topDonaters: 10,
        topDonats: 15,
        lastDonats: 15,
        contexts: 30
    }
}