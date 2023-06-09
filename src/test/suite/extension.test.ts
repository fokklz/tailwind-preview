import * as assert from 'assert';
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtension from '../../extension';
import path = require('path');

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Extension should be present', () => {
        assert.ok(vscode.extensions.getExtension('fokklz.tailwind-preview'));
    });

    test('should activate', function () {
        this.timeout(1 * 60 * 1000);
        // create basic extension context for testing
        const extensionContext = {
            subscriptions: [],
            workspaceState: vscode.workspace,
            globalState: vscode.workspace,
            extensionUri: vscode.Uri.file(''),
            storageUri: vscode.Uri.file(''),
            globalStorageUri: vscode.Uri.file(''),
            logUri: vscode.Uri.file(''),
            extensionPath: '',
            asAbsolutePath: (relativePath: string) => '',
            storagePath: '',
            globalStoragePath: '',
            logPath: ''
        };
        myExtension.activate(extensionContext as unknown as vscode.ExtensionContext);
        assert.ok(true);
    });
    test('should register commands', async function() {
        // Wait for 1 second before checking for commands
        await new Promise(resolve => setTimeout(resolve, 1000));
    
        const commands = await vscode.commands.getCommands(true);
        const COMMANDS = [
            'tailwind-preview.startServer',
            'tailwind-preview.stopServer',
            // add all your commands here
        ];
        const foundCommands = commands.filter((value) => {
            return COMMANDS.includes(value);
        });
        assert.equal(foundCommands.length, COMMANDS.length, 'Some commands are not registered properly or a new command is not added to the test');
    });
});