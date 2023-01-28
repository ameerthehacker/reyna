#!/usr/bin/env node
import minimist from 'minimist';
import { startDevServer } from '../dev-server';
import logger from '../logger';

const { _: args, ...flags } = minimist(process.argv.slice(2));
const [command] = args;

if (!command) {
  logger.panic('no command was provided');
}

switch (command) {
  case 'dev': {
    startDevServer({});

    break;
  }
  default: {
    logger.panic(`unknown command ${command}`);
  }
}