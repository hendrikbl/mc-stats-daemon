import chalk from 'chalk'
import figures from 'figures'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cliui = require('cliui')

export type LogType = 'error' | 'warning' | 'info' | 'success'
export type FileEvent = 'add' | 'change' | 'unlink'

export function printLog(type: LogType, text: string, event?: FileEvent): void {
    const ui = cliui()

    let prefix = figures.bullet + ' UNKNOWN'

    switch (type) {
        case 'error':
            prefix = chalk.red(figures.cross + ' ERROR')
            break
        case 'warning':
            prefix = chalk.yellow(figures.warning + ' WARNING')
            break
        case 'info':
            prefix = chalk.blue(figures.info + ' INFO')
            break
        case 'success':
            prefix = chalk.green(figures.tick + ' SUCCESS')
            break

        default:
            break
    }

    ui.div(
        { text: prefix, width: 10 },
        { text: event || '', width: 10 },
        { text }
    )
    console.log(ui.toString())
}
