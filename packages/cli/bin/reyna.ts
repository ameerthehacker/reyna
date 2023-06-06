#!/usr/bin/env node
import minimist from 'minimist';
import logger from '../logger';
import { startDevServer } from '../dev';
import { build } from '../build';
import { start } from '../start';

const { _: args } = minimist(process.argv.slice(2));
const [command] = args;

if (!command) {
  logger.panic('reyna: no command was provided');
}

switch (command) {
  case 'start': {
    start({});
    
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
    logger.panic(`reyna: unknown command ${command}`);
  }
}
