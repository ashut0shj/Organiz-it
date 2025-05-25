import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

interface TerminalInfo {
  name: string;
  cwd?: string;
  processId?: number;
  lastCommand?: string;
}

export function activate(context: vscode.ExtensionContext) {
  // Create CSV file if it doesn't exist
  const workspaceCsvPath = path.join(context.extensionPath, 'vscode-activity-log.csv');
  const terminalCsvPath = path.join(context.extensionPath, 'vscode-terminal-log.csv');
  
  if (!fs.existsSync(workspaceCsvPath)) {
    fs.writeFileSync(workspaceCsvPath, 'Timestamp,Workspace Folders\n');
  }
  
  if (!fs.existsSync(terminalCsvPath)) {
    fs.writeFileSync(terminalCsvPath, 'Timestamp,Terminal Count,Terminal Details\n');
  }
  
  // Log current workspace folders when extension activates
  logCurrentWorkspaceFolders(workspaceCsvPath);
  
  // Log current terminal status when extension activates
  logTerminalStatus(terminalCsvPath);
  
  // Set up event listener for workspace folder changes
  const workspaceFoldersChangeListener = vscode.workspace.onDidChangeWorkspaceFolders(() => {
    logCurrentWorkspaceFolders(workspaceCsvPath);
  });
  
  // Set up event listeners for terminal events
  const terminalCreateListener = vscode.window.onDidOpenTerminal(() => {
    logTerminalStatus(terminalCsvPath);
  });
  
  const terminalCloseListener = vscode.window.onDidCloseTerminal(() => {
    logTerminalStatus(terminalCsvPath);
  });
  
  // Listen for terminal data events to capture commands
  // Note: This requires VS Code 1.54.0 or newer
  const terminalDataListener = vscode.window.onDidWriteTerminalData((e) => {
    // We can try to detect command execution based on terminal output patterns
    // This is a simplified approach and might need refinement
    if (e.data.includes('\n') || e.data.includes('\r')) {
      // Delay the logging a bit to allow the command to be processed
      setTimeout(() => logTerminalStatus(terminalCsvPath), 100);
    }
  });
  
  context.subscriptions.push(
    workspaceFoldersChangeListener,
    terminalCreateListener,
    terminalCloseListener,
    terminalDataListener
  );
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

async function logTerminalStatus(csvFilePath: string) {
  const terminals = vscode.window.terminals;
  const timestamp = new Date().toISOString();
  
  // Collect information about all terminals
  const terminalPromises = terminals.map(async (terminal): Promise<TerminalInfo> => {
    const info: TerminalInfo = {
      name: terminal.name
    };
    
    try {
      // Get process ID (useful for identifying terminals)
      const processId = await terminal.processId;
      info.processId = processId;
      
      // Attempt to get working directory
      // Note: This might not always be available depending on shell type
      const cwdExecResult = await vscode.commands.executeCommand<string>(
        'workbench.action.terminal.getCwd',
        { target: terminal }
      );
      
      if (cwdExecResult) {
        info.cwd = cwdExecResult;
      }
      
      // Detecting the running command is challenging
      // We can only make educated guesses based on terminal name and patterns
      if (terminal.name.includes('npm')) {
        info.lastCommand = `npm (possibly ${terminal.name.replace('npm: ', '')})`;
      } else if (terminal.name.includes('yarn')) {
        info.lastCommand = `yarn (possibly ${terminal.name.replace('yarn: ', '')})`;
      } else if (terminal.name.includes('running')) {
        info.lastCommand = terminal.name;
      }
      
      return info;
    } catch (err) {
      // In case of errors, return what we have
      return info;
    }
  });
  
  const terminalInfos = await Promise.all(terminalPromises);
  
  // Format terminal info as JSON and escape for CSV
  const terminalCount = terminals.length;
  const terminalDetails = JSON.stringify(terminalInfos).replace(/"/g, '""');
  
  // Append data to CSV
  const csvLine = `"${timestamp}","${terminalCount}","${terminalDetails}"\n`;
  fs.appendFileSync(csvFilePath, csvLine);
}

export function deactivate() {}