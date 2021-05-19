import { CommandModule } from 'yargs'
import chalk from 'chalk'
import chokidar from 'chokidar'
import figures from 'figures'
import filehandle from 'fs/promises'
import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cliui = require('cliui')

interface CommandOptions {
    config: string
}

interface Player {
    id: string
    world: string
    stats: unknown
    timestamp: Date
}

interface Config {
    server: ServerConfig
    database: DatabaseConfig
}

interface ServerConfig {
    root: string
    worlds?: string[]
}

interface DatabaseConfig {
    url: string
}

type LogType = 'error' | 'warning' | 'info'
type FileEvent = 'add' | 'change' | 'unlink'

const watchCommand: CommandModule = {
    describe: 'watch server stats and import to db',
    command: 'watch [config]',
    builder: (yargs) =>
        yargs.strict().positional('config', {
            description: 'config yaml',
            type: 'string',
        }),

    handler: (args) => {
        const { config } = (args as unknown) as CommandOptions
        const { server, database } = getConfig(config)

        console.log(database)

        const worldPaths: string[] = []

        if (server.worlds) {
            server.worlds.forEach((world) => {
                worldPaths.push(`${server.root}/${world}/stats/*.json`)
            })
        }

        const watcher = chokidar.watch(worldPaths, {
            ignored: /(^|\/\\])\../, // ignore dotfiles
            persistent: true,
        })

        // Add event listeners.
        watcher
            .on('add', (path) => handleEvent('add', path))
            .on('change', (path) => handleEvent('change', path))
            .on('unlink', (path) => handleEvent('unlink', path))
    },
}

function getConfig(cPath: string): Config {
    const cYaml = yaml.load(fs.readFileSync(cPath, 'utf-8')) as Config
    return cYaml
}

async function handleEvent(event: FileEvent, file: string) {
    if (event == 'unlink') {
        printLog('warning', event, file)
    } else {
        try {
            const player = await parseJson(file)
            printLog('info', event, JSON.stringify(player))
        } catch (error) {
            printLog('error', event, error.message)
        }
    }
}

const parseJson = async (fPath: string): Promise<Player> => {
    const timestamp = new Date()
    const content = await filehandle.readFile(fPath)
    const stats = JSON.parse(content.toString())

    const worldPath = fPath.split(path.sep)
    const world = worldPath[worldPath.length - 3]

    const id = path.basename(fPath, path.extname(fPath))

    const player: Player = { id, world, stats, timestamp }
    return player
}

function printLog(type: LogType, event: FileEvent, text: string) {
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

        default:
            break
    }

    ui.div({ text: prefix, width: 10 }, { text: event, width: 10 }, { text })
    console.log(ui.toString())
}

export default watchCommand
