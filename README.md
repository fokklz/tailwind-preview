# Tailwind Preview

Tailwind Preview is a Visual Studio Code extension designed to enhance your workflow when working with Tailwind CSS. It provides a live preview of your HTML code, including Tailwind CSS, allowing you to see changes in real-time as you work.

## Features

- Live preview of HTML with Tailwind CSS.
- Automatic server management: The extension starts and stops a local server for the preview as needed.
- Real-time updates: The preview updates in real-time as you edit your HTML code with Tailwind CSS.

## Installation

You can install the Tailwind Preview extension directly from the Visual Studio Code Marketplace. Just search for "Tailwind Preview" in the Extensions view (Ctrl+Shift+X).

## Usage

1. Open a Workspace that contains Tailwind CSS.
2. Focus on a file containing HTML with Tailwind CSS.
3. Run the `tailwind-preview.startServer` command from the Command Palette (Ctrl+Shift+P). This will start the preview server.
4. The preview will open automatically.
5. As you edit your HTML code with Tailwind CSS, the live preview will update in real-time.
6. When you're done, you can stop the preview server by running the `tailwind-preview.stopServer` command from the Command Palette. If the Workspace is closed, the server will stop automatically.

Make sure to run Tailwind CSS with the `--watch` option. The CSS file specified in the settings will be watched for changes and will trigger a live update when modified.

## Requirements

- Visual Studio Code
- Tailwind CSS

## Settings

```json
{
    "cssPath": "./style.css",
    "port": 7937,
    "openBrowser": true,
    "assetPaths": {}
}
```
| Setting     | Description                                                                 |
| ----------- | --------------------------------------------------------------------------- |
| cssPath     | The location of the Tailwind CSS file, relative to the workspace folder.    |
| port        | The default port to run the application on.                                 |
| openBrowser | If set to true, the browser will automatically open when the server starts. |
| assetPaths  | A key-value object containing paths to mount.                               |

## Known Issues

Please report any issues you encounter on the [GitHub repository](https://github.com/fokklz/tailwind-preview).

## Contributing

Contributions are welcome! Please submit a pull request on the [GitHub repository](https://github.com/fokklz/tailwind-preview).

## License

[Apache-2.0 license](https://github.com/fokklz/tailwind-preview/blob/main/LICENSE)
