import chalk from 'chalk';

class Logger {
  info(message: string) {
    console.info(chalk.blue(message));
  }

  error(message: string) {
    console.error(chalk.red(message));
  }

  panic(message: string) {
    console.error(chalk.red(message));
    process.exit(1);
  }
}

const logger = new Logger();
export default logger;
