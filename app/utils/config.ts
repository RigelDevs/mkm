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
    default_duration: number;
  };
  security: {
    allowed_ips: string[];
  };
  logging: {
    level: string;
    format: string;
    file_enabled: boolean;
    console_enabled: boolean;
  };
}

const configPath = join(process.cwd(), 'config', 'default.toml');

let config: Config;

try {
  const configFile = readFileSync(configPath, 'utf-8');
  config = parse(configFile) as Config;
  
  console.log('✅ Configuration loaded');
  // console.log(`   MKM Base URL: ${config.mkm.base_url}`);
  // console.log(`   Default Duration: ${config.mkm.default_duration} minutes`);
  // console.log(`   Client ID: ${config.mkm.client_id}`);
  
} catch (error) {
  console.error('❌ Failed to load configuration:', error);
  throw error;
}

export { config };