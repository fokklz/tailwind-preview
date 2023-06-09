// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
// @ts-ignore
import * as opn from 'opn';
import * as vscode from 'vscode';
import { PreviewServer, ServerData } from './classes/preview-server.class';

let previewServer: PreviewServer;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// initialize the server
	previewServer = new PreviewServer();

	const startServer = vscode.commands.registerCommand('tailwind-preview.startServer', () => {
		previewServer.createServer().then((res: ServerData) => {
			if(res.config.openBrowser){
				opn(`http://localhost:${res.config.port}`);
			}else{
				vscode.window.showInformationMessage(`Tailwind Preview server started on port ${res.config.port}.`, 'View').then((action) => {
					if (action === 'View') {
						opn(`http://localhost:${res.config.port}`);
					}
				});
			}
		});
	});
	context.subscriptions.push(startServer);

	const stopServer = vscode.commands.registerCommand('tailwind-preview.stopServer', () => {
		previewServer.stopServer().then(() => {
			vscode.window.showInformationMessage('Tailwind Preview server stopped.');
		});
	});
	context.subscriptions.push(stopServer);

	vscode.workspace.onDidChangeTextDocument(async event => {
		if (event.document === vscode.window.activeTextEditor?.document) {
			const parts = event.document.fileName.split('.');
			const extension = parts[parts.length - 1];
			const {socket} = await previewServer.getCurrentServer();
			const allowed = ['html', 'ejs'];
			if (socket && allowed.includes(extension)) {
				socket.send(JSON.stringify({event: 'html', data: vscode.window.activeTextEditor?.document.getText(), file: event.document.fileName}));
			}
		}
	}, undefined, context.subscriptions);

}

// This method is called when your extension is deactivated
export function deactivate() {
	if (previewServer) {
		previewServer.stopServer().then(() => {
			vscode.window.showInformationMessage('Tailwind Preview server stopped.');
		});
	}
}
