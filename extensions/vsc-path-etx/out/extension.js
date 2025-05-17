"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
function activate(context) {
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
exports.activate = activate;
function logCurrentWorkspaceFolders(csvFilePath) {
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
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map