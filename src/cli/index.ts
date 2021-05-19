#!/usr/bin/env node

import * as yargs from 'yargs'
import watchCommand from './commands/watch-stats'

export default yargs
    .scriptName('mc-stats-daemon')
    .parserConfiguration({
        'camel-case-expansion': true,
    })
    // version
    .version()
    .alias('v', 'version')
    // help
    .help(true)
    .alias('h', 'help')
    .strict()
    .wrap(yargs.terminalWidth())
    .command(watchCommand)
    .demandCommand(1).argv
