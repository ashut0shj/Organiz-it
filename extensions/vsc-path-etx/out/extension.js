"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
function activate(context) {
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
exports.activate = activate;
function logCurrentWorkspaceFolders(csvFilePath) {
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
function getSharedDirectoryPath() {
    if (process.platform === 'win32') {
        return path.join('C:', 'Users', 'Public', 'Documents', 'VSCodeLogs');
    }
    else if (process.platform === 'darwin') {
        return path.join('/Users', 'Shared', 'vscode-logs');
    }
    else {
        return path.join('/home', 'shared', 'vscode-logs');
    }
}
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map