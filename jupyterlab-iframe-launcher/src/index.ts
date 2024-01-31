import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { ILauncher } from '@jupyterlab/launcher';

namespace CommandIDs {
  export const open_iframe = 'jlab:open-iframe';
}

const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-iframe-launcher:plugin',
  description: 'Adds a custom iframe item that opens an iframe when clicked.',
  autoStart: true,
  optional: [ISettingRegistry],
  activate: (
    app: JupyterFrontEnd,
    settingRegistry: ISettingRegistry | null,
    launcher: ILauncher | null
  ) => {
    const { commands } = app;
    const command = CommandIDs.open_iframe;
    console.log('JupyterLab extension jupyterlab-iframe-launcher is activated!');

    if (settingRegistry) {
      settingRegistry
        .load(plugin.id)
        .then(settings => {
          console.log('jupyterlab-iframe-launcher settings loaded:', settings.composite);
        })
        .catch(reason => {
          console.error('Failed to load settings for jupyterlab-iframe-launcher.', reason);
        });
    }

    commands.addCommand(command, {
      label: 'Custom command',
      caption: 'Custom command caption',
      icon: undefined,
      // icon: args => (args['isPalette'] ? undefined : icon),
      execute: async args => {
        const url = 'http://google.com';
        await commands.execute('iframe:open', { url });
      }
    });

    if (launcher) {
      launcher.add({
        command,
        category: 'Other',
        rank: 2
      });
    }

  }
};

export default plugin;
