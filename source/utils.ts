const ansi = require('ansi-colors');
const Symbols = {
    ...ansi.symbols
}

const ConsoleMessage = {
    normal: (...message: string[]) => {
        console.log(`${ansi.green(Symbols.pointerSmall)} ${ansi.bold(message.join('\n'))}`)
    },
    success: (...message: string[]) => {
        console.log(`${ansi.green(Symbols.check)} ${ansi.bold(message.join('\n'))}`)
    },
    error: (...message: string[]) => {
        console.log(`${ansi.red(`${Symbols.cross} ${message.join('\n')}`)}`)
    },
}

export {
    ConsoleMessage
}