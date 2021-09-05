import readline from 'readline'

export default async function input(text: string) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })
    let rl_rext = await new Promise<string>((res) => {
        rl.question(text, res)
    })
    rl.close()
    return rl_rext
}