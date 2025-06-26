import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
  try {
    // Log current workspace when extension activates
    logWorkspace();
    
    // Set up event listener for workspace folder changes
    const workspaceFoldersChangeListener = vscode.workspace.onDidChangeWorkspaceFolders(() => {
      logWorkspace();
    });
    
    context.subscriptions.push(workspaceFoldersChangeListener);
  } catch (error) {
    console.error('Extension activation failed:', error);
  }
}

function logWorkspace() {
  try {
    // Skip if no workspace folders
    if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
      return;
    }

    const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const historyFilePath = path.join(workspaceRoot, 'history.json');
    
    // Check if we can write to the workspace directory
    try {
      fs.accessSync(workspaceRoot, fs.constants.W_OK);
    } catch (error) {
      console.error('Cannot write to workspace directory:', workspaceRoot);
      return;
    }
    
    // Create new entry
    const newEntry = {
      'vscode': workspaceRoot,
      'date created': new Date().toISOString()
    };
    
    // Read existing history or create new array
    let history = [];
    if (fs.existsSync(historyFilePath)) {
      try {
        const existingData = fs.readFileSync(historyFilePath, 'utf8');
        history = JSON.parse(existingData);
      } catch (error) {
        history = [];
      }
    }
    
    // Append new entry
    history.push(newEntry);
    
    // Write back to file
    fs.writeFileSync(historyFilePath, JSON.stringify(history, null, 2));
    
  } catch (error) {
    console.error('Error in logWorkspace:', error);
  }
}

export function deactivate() {}