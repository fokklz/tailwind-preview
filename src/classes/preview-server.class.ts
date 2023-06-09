import * as vscode from 'vscode';
import * as express from 'express';
import * as WebSocket from 'ws';
import * as path from 'path';
import * as fs from 'fs';
import * as http from 'http';
import internal = require('stream');
import mime = require('mime');

export interface ServerConfig {
	root: string,
	port: number,
	cssPath: string,
	assetPaths: { [key: string]: string }
	openBrowser: boolean,
}

export interface ServerData {
	httpServer: http.Server,
	config: ServerConfig,
	name: string,
	watcher: fs.FSWatcher,
	socket?: WebSocket,
}

export class PreviewServer {
	private _wss: WebSocket.Server;
	private _servers: Map<string, ServerData> = new Map();
	private _handlers: ((message: string) => void)[] = [];
	
	public createServer(overwrites: Partial<ServerConfig> = {}): Promise<ServerData> {
		return new Promise((resolve, reject) => {
			// server name
			const name = vscode.workspace.name ?? 'default';
			// generate the config
			const config = this.generateConfig(vscode.workspace.getConfiguration('tailwind-preview'), overwrites);

			// if the server already exists, return it
			if (this._servers.has(name)) {
				return resolve(this._servers.get(name)!);
			}

			// create the express app
			const app = express();

			// setup css route
			app.get('/style.css', (req, res) => {
				res.contentType('text/css');
				res.sendFile(path.join(config.root, config.cssPath));
			});

			// setup HTML route
			app.get('/', (req, res) => {
				res.contentType('text/html');
				res.send(this._generateHTML(config));
			});

			// setup confiured asset routes
			Object.keys(config.assetPaths).forEach((assetPath) => {
				const folderPath = path.join(config.root, config.assetPaths[assetPath]);
				app.use(`/${assetPath}`, express.static(folderPath, { index: false }));
			});

			// create server
			const httpServer = http.createServer(app);
			const data: ServerData = {
				httpServer, config, name, watcher: fs.watch(path.join(config.root, config.cssPath), () => {
					if (data.socket) {
						data.socket.send(JSON.stringify({ event: 'reload' }));
					}
				})
			};

			// store websocket on connection
			httpServer.on('upgrade', (request: express.Request, socket: internal.Duplex, head: Buffer) => {
				this._wss.handleUpgrade(request, socket, head, (ws) => {
					const currentData = this._servers.get(name);
					currentData!.socket = ws;
					this._servers.set(name, currentData!);
				});
			});

			// start the server
			httpServer.listen(config.port, () => {
				this._servers.set(name, data);
				return resolve(data);
			});
		});
	}

	public getCurrentServer(): Promise<ServerData> {
		return new Promise((resolve, reject) => {
			const name = vscode.workspace.name ?? 'default';
			const server = this._servers.get(name);
			if (!server) return reject('No server found');
			resolve(server);
		});
	}

	public stopServer(): Promise<void> {
		return new Promise(async (resolve, reject) => {
			try {
				const server = await this.getCurrentServer();
				server.httpServer.close(() => {
					this._servers.delete(server.name);
					resolve();
				});
			}catch(e) {
				resolve();
			}
		});
	}

	private _generateHTML(config: ServerConfig): string {
		return `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Preview</title>
			<link rel="stylesheet" href="/style.css" id="tailwind-preview-css">
			<style>
			.btn234234234234 {
				padding: 0.4rem 0.6rem;
				border: 1px solid #ccc;
				border-radius: 0.2rem;
				background-color: #fff;
				cursor: pointer;
				margin-left: 0.4rem;
			}
			</style>
		</head>
		<body>
		<nav style="display: flex; flex-direction: row; padding: 0.4rem 0.6rem; background-color: #f8f8f8;">
			<span style="margin: auto 0;" id="file-name">${vscode.window.activeTextEditor?.document.fileName}</span>
			<span style="flex: 1 1 auto;"></span>
			<button class="btn234234234234" id="btn-toggle">Toggle</button>
			<button class="btn234234234234" id="btn-refresh">Refresh</button>
		</nav>
		<div id="app">
			${vscode.window.activeTextEditor?.document.getText()}
		</div>
		<script>
		var ws = new WebSocket('ws://localhost:${config.port}');
		ws.onmessage = function(event) {
			let message = JSON.parse(event.data);
			console.log('Message from server', message);
			switch (message.event) {
				case 'html':
					document.getElementById('app').innerHTML = message.data;
					document.getElementById('file-name').innerText = message.file;
					break;
				case 'reload':
					document.getElementById('tailwind-preview-css').href = '/style.css?v=' + new Date().getTime();
					break;
				case 'test':
					ws.send('test');
					break;
			}
		};

		document.getElementById('btn-toggle').addEventListener('click', function() {
			document.body.classList.toggle('dark');
		});
		document.getElementById('btn-refresh').addEventListener('click', function() {
			location.reload();
		});
		</script>
		</body>
		</html>`
	}

	private generateConfig(config: vscode.WorkspaceConfiguration, overwrites: Partial<ServerConfig>): ServerConfig {
		return {
			root: overwrites.root ? overwrites.root : vscode.workspace.workspaceFolders![0].uri.fsPath ?? null,
			port: overwrites.port ? overwrites.port : config.get<number>('port') ?? 3000,
			cssPath: overwrites.cssPath ? overwrites.cssPath : config.get<string>('cssPath') ?? 'css/style.css',
			assetPaths: overwrites.assetPaths ? overwrites.assetPaths : config.get<{ [key: string]: string }>('assetPaths') ?? {},
			openBrowser: overwrites.openBrowser ? overwrites.openBrowser : config.get<boolean>('openBrowser') ?? true,
		};
	}

	// added to allow adding handlers while testing
	public registerHandler(handler: (message: string) => void) {
		this._handlers.push(handler);
	}

	constructor() {
		// basic initialization to avoid undefined errors
		this._wss = new WebSocket.Server({ noServer: true });

		this._wss.on('connection', (ws: WebSocket) => {

			// TODO: cahnge logic to make handlers obsolete
			// maybe callback on send instead, or event emitter
			ws.on('message', (message: Buffer) => {
				let msg = message.toString();
				if (msg.startsWith('connected')) {
					const name = msg.split(': ')[1];
					const server = this._servers.get(name);
					this._servers.set(name, { ...server!, socket: ws });
				}
				this._handlers.forEach(handler => handler(msg));
			});
		});
	}

	public sendReload() {
		this.sendSocketBroadcast('reload');
	}

	public sendSocketBroadcast(message: string) {
		this._wss.clients.forEach((client) => {
			client.send(message);
		});
	}



}