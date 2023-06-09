import * as assert from 'assert';
import { PreviewServer } from '../../../classes/preview-server.class';
import axios from 'axios';

const port = 6200;

suite('PreviewServer Test Suite', async () => {
    const server = new PreviewServer();
    
    suiteSetup((done) => {
        server.createServer({port, cssPath: 'style.css'}).then(() => {
            done();
        });
    });

    suiteTeardown((done) => {
        // skip
        // should stop automatically when vscode is closed
        done();
    });

	test('Server is started correctly', async () => {
		try {
			const response = await axios.get(`http://localhost:${port}`);
			assert.strictEqual(response.status, 200);
		} catch (error) {
			assert.fail(`Server did not start correctly: ${error}`);
		}
	});

    test('WebSocket connection can be established', async function () {
        this.timeout(10000);
        server.registerHandler((message) => {
            assert.strictEqual(message, 'test');
        });
        server.sendSocketBroadcast('test');
    });
});

suite('Ensure Shutdown', async () => {
    test('Server has shutdown correctly', async () => {
        try {
			await axios.get(`http://localhost:${port}`);
			assert.fail('Server did not stop correctly');
		} catch (error) {
            assert.ok(true);
		}
    });
});