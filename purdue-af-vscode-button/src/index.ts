import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { PageConfig, URLExt } from '@jupyterlab/coreutils';

import { ServerConnection } from '@jupyterlab/services';

import '@jupyterlab/application/style/buttons.css';

const COMMAND_NAMESPACE = 'jupyterlab-topbar';
export const SWITCH_TO_VSCODE_COMMAND = `${COMMAND_NAMESPACE}:switch-to-vscode`;

/**
 * Resolve the code-server workspace folder for the ?folder= query param.
 */
function getHomeDirectory(baseUrl: string): string {
  const hubUser = PageConfig.getOption('hubUser');
  if (hubUser) {
    return `/home/${hubUser}`;
  }

  const userMatch = baseUrl.match(/\/user\/([^/]+)\/?/);
  if (userMatch) {
    return `/home/${userMatch[1]}`;
  }

  const notebookDir = PageConfig.getOption('notebookDir');
  if (notebookDir) {
    return notebookDir;
  }

  return '/home/jovyan';
}

const plugin: JupyterFrontEndPlugin<void> = {
  id: 'purdue-af-vscode-button:plugin',
  description: 'Adds a topbar button to open VS Code (code-server)',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension purdue-af-vscode-button is activated!');

    app.commands.addCommand(SWITCH_TO_VSCODE_COMMAND, {
      label: '↗ Switch to VSCode',
      caption: 'Open code-server (VS Code) in a new browser tab',
      execute: () => {
        const settings = ServerConnection.makeSettings();
        const homeDir = getHomeDirectory(settings.baseUrl);
        const vscodeUrl = URLExt.join(settings.baseUrl, 'vscode/');
        const url = `${vscodeUrl}?folder=${encodeURIComponent(homeDir)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    });
  }
};

export default plugin;
