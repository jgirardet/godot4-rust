import * as vscode from "vscode";
import * as winston from "winston";
import { LogOutputChannelTransport } from "winston-transport-vscode";
import { DISPLAY_NAME } from "./constantes";

export { logger, log_error };

const outputChannel = vscode.window.createOutputChannel(DISPLAY_NAME, {
  log: true,
});

const logger = winston.createLogger({
  level: "trace",
  levels: LogOutputChannelTransport.config.levels,
  format: LogOutputChannelTransport.format(),
  transports: [new LogOutputChannelTransport({ outputChannel })],
});

const log_error = async (f: () => Promise<void>) => {
  try {
    await f();
  } catch (e) {
    logger.error(e);
  }
};
