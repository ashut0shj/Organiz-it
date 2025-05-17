import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
  // Create CSV file if it doesn't exist
  const csvFilePath = path.join(context.extensionPath, 'vscode-activity-log.csv');
  if (!fs.existsSync(csvFilePath)) {
    fs.writeFileSync(csvFilePath, 'Timestamp,Workspace Folders\n');
  }

  // Log current workspace folders when extension activates
  logCurrentWorkspaceFolders(csvFilePath);

  // Set up event listener for workspace folder changes
  const workspaceFoldersChangeListener = vscode.workspace.onDidChangeWorkspaceFolders(() => {
    logCurrentWorkspaceFolders(csvFilePath);
  });

  context.subscriptions.push(workspaceFoldersChangeListener);
}

function logCurrentWorkspaceFolders(csvFilePath: string) {
  // Skip if no workspace folders
  if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
    return;
  }

  // Create timestamp
  const timestamp = new Date().toISOString();
  
  // Format workspace folders
  const workspaceFolders = vscode.workspace.workspaceFolders
    .map(folder => folder.uri.fsPath)
    .join(';');

  // Append data to CSV
  const csvLine = `"${timestamp}","${workspaceFolders}"\n`;
  fs.appendFileSync(csvFilePath, csvLine);
}

export function deactivate() {}