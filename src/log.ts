import * as vscode from "vscode";
import * as winston from "winston";
import { LogOutputChannelTransport } from "winston-transport-vscode";
import { DISPLAY_NAME } from "./constantes";


const outputChannel = vscode.window.createOutputChannel(DISPLAY_NAME, {
  log: true,
});

export const logger = winston.createLogger({
  level: "trace",
  levels: LogOutputChannelTransport.config.levels,
  format: LogOutputChannelTransport.format(),
  transports: [new LogOutputChannelTransport({ outputChannel })],
});
