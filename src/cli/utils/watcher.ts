import { DatabaseConfig, writePlayer } from './database'
import { FileEvent, printLog } from './renderer'
import { ServerProperties, parseJson } from './server'
import chokidar from 'chokidar'

export function startWatcher(
    paths: string[],
    database: DatabaseConfig,
    properties: ServerProperties
): void {
    const watcher = chokidar.watch(paths, {
        ignored: /(^|\/\\])\../, // ignore dotfiles
        persistent: true,
    })

    // Add event listeners
    watcher
        .on('add', (path) => {
            handleEvent('add', path, database, properties)
        })
        .on('change', (path) =>
            handleEvent('change', path, database, properties)
        )
        .on('unlink', (path) =>
            handleEvent('unlink', path, database, properties)
        )
}

async function handleEvent(
    event: FileEvent,
    file: string,
    database: DatabaseConfig,
    properties: ServerProperties
) {
    if (event == 'unlink') {
        printLog('warning', file, event)
    } else {
        try {
            const player = await parseJson(file)
            writePlayer(player, database, properties)
            printLog('info', player.id + ' at ' + player.world, event)
        } catch (error) {
            printLog('error', event, error.message)
        }
    }
}
