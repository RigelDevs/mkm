import { readFileSync } from 'fs';
import { parse } from 'toml';
import { join } from 'path';

interface Config {
  server: {
    port: number;
    host: string;
  };
  certs: {
    public_key: string;
    private_key: string;
  };
  mkm: {
    base_url: string;
    client_id: string;
    client_secret: string;
    timeout: number;
  };
  security: {
    allowed_ips: string[];
  };
  logging: {
    level: string;
    format: string;
  };
}

const configPath = join(process.cwd(), 'config', 'default.toml');
const configFile = readFileSync(configPath, 'utf-8');
export const config: Config = parse(configFile) as Config;