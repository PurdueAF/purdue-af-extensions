import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

/**
 * Initialization data for the purdue-af-grafana-iframe extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'purdue-af-grafana-iframe:plugin',
  description: 'Adds a button to the launcher, which opens an iframe with a Grafana dashboard.',
  autoStart: true,
  optional: [ISettingRegistry],
  activate: (app: JupyterFrontEnd, settingRegistry: ISettingRegistry | null) => {
    console.log('JupyterLab extension purdue-af-grafana-iframe is activated!');

    if (settingRegistry) {
      settingRegistry
        .load(plugin.id)
        .then(settings => {
          console.log('purdue-af-grafana-iframe settings loaded:', settings.composite);
        })
        .catch(reason => {
          console.error('Failed to load settings for purdue-af-grafana-iframe.', reason);
        });
    }
  }
};

export default plugin;
