import { Player } from './database'
import filehandle from 'fs/promises'
import fs from 'fs'
import path from 'path'

export interface ServerConfig {
    root: string
    worlds?: string[]
}

export interface ServerProperties {
    motd: string
    [x: string]: any
}

export const DEFAULT_WORLDS = ['world']

function parseValue(val: string) {
    if (val === '') return null

    try {
        return JSON.parse(val)
    } catch (e) {
        // do nothing, this is just a short way to extract values like:
        // true, false, [Numbers], etc.
        return val
    }
}

export function parseProperties(root: string): ServerProperties {
    const data = fs.readFileSync(path.join(root, 'server.properties'), 'utf8')

    const output = {}

    data.split(/[\r\n]+/g).forEach(function (line) {
        if (line[0] === '#' || line.indexOf('=') < 0) return // just a comment

        const parts = line.split('='),
            key = parts[0].trim(),
            val = parts[1].trim()

        if (!key) return

        output[key] = parseValue(val)
    })

    return output as ServerProperties
}

export function getWorldPaths(conf: ServerConfig): string[] {
    const worldPaths: string[] = []

    if (!conf.worlds) {
        conf.worlds = DEFAULT_WORLDS
    }

    conf.worlds.forEach((world) => {
        worldPaths.push(path.join(conf.root, world, 'stats', '*.json'))
    })

    return worldPaths
}

export const parseJson = async (fPath: string): Promise<Player> => {
    const timestamp = new Date()
    const content = await filehandle.readFile(fPath)
    const stats = JSON.parse(content.toString()).stats

    const worldPath = fPath.split(path.sep)
    const world = worldPath[worldPath.length - 3]

    const id = path.basename(fPath, path.extname(fPath))

    const player: Player = { id, world, stats, timestamp }
    return player
}
