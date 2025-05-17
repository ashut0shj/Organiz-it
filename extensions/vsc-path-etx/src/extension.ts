import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export function activate(context: vscode.ExtensionContext) {
  const sharedDir = getSharedDirectoryPath();
  const csvFilePath = path.join(sharedDir, 'vscode-activity-log.csv');

  
  if (!fs.existsSync(sharedDir)) {
    fs.mkdirSync(sharedDir, { recursive: true });
  }

  
  if (!fs.existsSync(csvFilePath)) {
    fs.writeFileSync(csvFilePath, 'Timestamp,Workspace Folders\n');
  }

  
  logCurrentWorkspaceFolders(csvFilePath);

  
  const workspaceFoldersChangeListener = vscode.workspace.onDidChangeWorkspaceFolders(() => {
    logCurrentWorkspaceFolders(csvFilePath);
  });

  context.subscriptions.push(workspaceFoldersChangeListener);
}

function logCurrentWorkspaceFolders(csvFilePath: string) {
  if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
    return;
  }

  const timestamp = new Date().toISOString();
  const workspaceFolders = vscode.workspace.workspaceFolders
    .map(folder => folder.uri.fsPath)
    .join(';');

  const csvLine = `"${timestamp}","${workspaceFolders}"\n`;
  fs.appendFileSync(csvFilePath, csvLine);
}

function getSharedDirectoryPath(): string {
  if (process.platform === 'win32') {
    return path.join('C:', 'Users', 'Public', 'Documents', 'VSCodeLogs');
  } else if (process.platform === 'darwin') {
    return path.join('/Users', 'Shared', 'vscode-logs');
  } else {
    return path.join('/home', 'shared', 'vscode-logs');
  }
}

export function deactivate() {}
