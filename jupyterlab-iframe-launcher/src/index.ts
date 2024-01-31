import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { ICommandPalette } from '@jupyterlab/apputils';

import { ILauncher } from '@jupyterlab/launcher';

const PALETTE_CATEGORY = 'Extensions';
const LAUNCHER_CATEGORY = 'Other';

namespace CommandIDs {
  export const open_iframe = 'jlab:open-iframe-from-launcher';
}

const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-iframe-launcher:plugin',
  description: 'Adds a custom iframe item that opens an iframe when clicked.',
  autoStart: true,
  optional: [ISettingRegistry, ILauncher, ICommandPalette],
  activate: async (
    app: JupyterFrontEnd,
    settingRegistry: ISettingRegistry | null,
    launcher: ILauncher | null,
    palette: ICommandPalette | null
  ) => {
    const { commands } = app;
    const command = CommandIDs.open_iframe;
    console.log('JupyterLab extension jupyterlab-iframe-launcher is activated!');

    let url = '';
    let launcherItemLabel = 'Open iframe';
    let launcherItemCaption = 'Open iframe in a new tab';
    let launcherItemRank = 1;

    if (settingRegistry) {
      try {
        const settings = await settingRegistry.load(plugin.id);
        if ('url' in settings.composite) {
          url = settings.composite['url'] as string;
        }
        if ('label' in settings.composite) {
          launcherItemLabel = settings.composite['label'] as string;
        }
        if ('caption' in settings.composite) {
          launcherItemCaption = settings.composite['caption'] as string;
        }
        if ('rank' in settings.composite) {
          launcherItemRank = parseInt(settings.composite['rank'] as string, 10) || launcherItemRank;
        }
        console.log('jupyterlab-iframe-launcher settings loaded:', settings.composite);
      } catch (reason) {
        console.error('Failed to load settings for jupyterlab-iframe-launcher.', reason);
      }
    }

    
    commands.addCommand(command, {
      label: launcherItemLabel,
      caption: launcherItemCaption,
      icon: undefined,
      // icon: args => (args['isPalette'] ? undefined : icon),
      execute: async args => {
        await commands.execute('iframe:open', { path:url });
      }
    });

    if (launcher) {
      launcher.add({
        command,
        category: LAUNCHER_CATEGORY,
        rank: launcherItemRank
      });
    }

    if (palette) {
      palette.addItem({
        command,
        args: { isPalette: true },
        category: PALETTE_CATEGORY
      });
    }

  }
};

export default plugin;