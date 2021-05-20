import { DatabaseConfig } from './database'
import { ServerConfig } from './server'
import fs from 'fs'
import yaml from 'js-yaml'

interface Config {
    server: ServerConfig
    database: DatabaseConfig
}

export function getConfig(cPath: string): Config {
    const cYaml = yaml.load(fs.readFileSync(cPath, 'utf-8')) as Config
    return cYaml
}
