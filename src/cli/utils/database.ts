import { InfluxDB, Point } from '@influxdata/influxdb-client'
import { ServerProperties } from './server'
import { hostname } from 'os'
import fetch from 'node-fetch'

export interface Player {
    id: string
    world: string
    stats: any
    timestamp: Date
}

export interface DatabaseConfig {
    url: string
    token: string
}
export async function checkDatabase(url: string): Promise<boolean> {
    try {
        const response = await fetch(url + '/ping')

        if (response.status == 204) {
            return true
        } else {
            return false
        }
    } catch (error) {
        return false
    }
}

export function writePlayer(
    player: Player,
    database: DatabaseConfig,
    properties: ServerProperties
): void {
    const writeApi = new InfluxDB({
        url: database.url,
        token: database.token,
    }).getWriteApi('mc-stats', 'mc-stats', 'ns')
    writeApi.useDefaultTags({
        host: hostname(),
        motd: properties.motd,
        player: player.id,
        world: player.world,
    })

    const points: Point[] = []

    for (const category in player.stats) {
        for (const stat in player.stats[category]) {
            const point = new Point(stat)
                .tag('category', category)
                .intField('value', player.stats[category][stat])
            points.push(point)
        }
    }

    writeApi.writePoints(points)
}
