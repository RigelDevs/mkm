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

let config: Config;

try {
  const configFile = readFileSync(configPath, 'utf-8');
  config = parse(configFile) as Config;
  
  // Validate required configuration
  if (!config.mkm.client_id) {
    throw new Error('MKM client_id is required in configuration');
  }
  
  if (!config.mkm.client_secret) {
    throw new Error('MKM client_secret is required in configuration');
  }
  
  if (!config.certs.private_key) {
    throw new Error('Private key path is required in configuration');
  }
  
  console.log('Configuration loaded successfully');
  console.log('- MKM Base URL:', config.mkm.base_url);
  console.log('- Client ID:', config.mkm.client_id);
  console.log('- Private Key Path:', config.certs.private_key);
  
} catch (error) {
  console.error('Failed to load configuration:', error);
  throw error;
}

export { config };