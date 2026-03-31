import * as vscode from 'vscode';

let channel: vscode.LogOutputChannel | undefined;

function getChannel(): vscode.LogOutputChannel {
  if (!channel) {
    channel = vscode.window.createOutputChannel('0.markview', { log: true });
  }
  return channel;
}

export function info(msg: string): void {
  getChannel().info(msg);
}

export function warn(msg: string): void {
  getChannel().warn(msg);
}

export function error(msg: string): void {
  getChannel().error(msg);
}

export function debug(msg: string): void {
  getChannel().debug(msg);
}

export function show(): void {
  getChannel().show();
}

export function dispose(): void {
  channel?.dispose();
  channel = undefined;
}
