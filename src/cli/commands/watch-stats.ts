import { CommandModule } from 'yargs'
import { checkDatabase } from '../utils/database'
import { getConfig } from '../utils/config'
import { getWorldPaths, parseProperties } from '../utils/server'
import { printLog } from '../utils/renderer'
import { startWatcher } from '../utils/watcher'

interface CommandOptions {
    config: string
}

const watchCommand: CommandModule = {
    describe: 'watch server stats and import to db',
    command: 'watch [config]',
    builder: (yargs) =>
        yargs.strict().positional('config', {
            description: 'config yaml',
            type: 'string',
        }),

    handler: async (args) => {
        const { config } = (args as unknown) as CommandOptions

        // parse config
        const { server, database } = getConfig(config)
        printLog('success', 'Parsed config')

        // check database
        const dbUp = await checkDatabase(database.url)
        if (!dbUp) {
            printLog('error', 'Database unreachable')
            process.exit()
        }
        printLog('success', 'Database is up')

        // parse server properties
        const properties = parseProperties(server.root)
        printLog('success', 'Parsed server.properties')

        // get world paths
        const worldPaths = getWorldPaths(server)
        worldPaths.forEach((wPath) => {
            printLog('info', 'Watching ' + wPath)
        })

        // create watcher
        startWatcher(worldPaths, database, properties)
    },
}

export default watchCommand
