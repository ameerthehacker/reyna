#!/usr/bin/env node
import minimist from 'minimist';
import { build } from '../build';
import { startDevServer } from '../dev-server';
import logger from '../logger';
import { startNodeServer } from '../server';

const { _: args } = minimist(process.argv.slice(2));
const [command] = args;

if (!command) {
  logger.panic('no command was provided');
}

switch (command) {
  case 'start': {
    startNodeServer('0.0.0.0', 3000, false);
    
    break;
  }
  case 'dev': {
    startDevServer({});

    break;
  }
  case 'build': {
    build();

    break;
  }
  default: {
    logger.panic(`unknown command ${command}`);
  }
}
