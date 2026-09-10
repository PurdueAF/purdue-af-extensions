import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  IRouter
} from '@jupyterlab/application';

import { Widget } from '@lumino/widgets';

import { URLExt } from '@jupyterlab/coreutils';

import { Dialog, showDialog } from '@jupyterlab/apputils';

import { ServerConnection } from '@jupyterlab/services';

import '@jupyterlab/application/style/buttons.css';

import '../style/index.css';

const plugin: JupyterFrontEndPlugin<void> = {
  id: 'purdue-af-shutdown-button:plugin',
  description: 'Adds a button that stops the Analysis Facility session',
  autoStart: true,
  requires: [IRouter],
  activate: async (app: JupyterFrontEnd, router: IRouter) => {
    console.log('JupyterLab extension purdue-af-shutdown-button is activated!');
    const { commands } = app;
    const namespace = 'jupyterlab-topbar';
    const command = namespace + ':shutdown';

    commands.addCommand(command, {
      label: 'Shut Down',
      caption: 'Shut down user session',
      className: 'jp-RunningSessions-shutdownAll',
      execute: (args: any) => {
        return showDialog({
          title: 'Shut down Analysis Facility session',
          body: 'Warning: unsaved data will be lost!',
          buttons: [
            Dialog.cancelButton(),
            Dialog.warnButton({ label: 'Shut Down' })
          ]
        }).then(async (result: any) => {
          if (result.button.accept) {
            const setting = ServerConnection.makeSettings();
            // Ask the Hub to stop the session, via this server's own endpoint.
            // Shutting the Jupyter server down instead (POST api/shutdown)
            // leaves the Hub believing the session is healthy: the pod keeps
            // running with nothing listening on it, so the session cannot be
            // used and never goes away. The Hub cannot be called straight from
            // here — its _xsrf cookie is scoped to /hub/, so this page cannot
            // read the token it would have to send.
            const apiURL = URLExt.join(
              setting.baseUrl,
              'purdue-af-shutdown-button',
              'stop'
            );

            return ServerConnection.makeRequest(
              apiURL,
              { method: 'POST' },
              setting
            )
              .then((result: any) => {
                if (result.ok) {
                  // Close this window if the shutdown request has been successful
                  const body = document.createElement('div');
                  const p1 = document.createElement('p');
                  p1.textContent =
                    'You have shut down the Analysis Facility session.';

                  const baseUrl = new URL(setting.baseUrl);
                  const link = document.createElement('a');
                  link.href =
                    baseUrl.protocol + '//' + baseUrl.host + '/hub/home';
                  link.textContent = 'Click here to start a new session.';
                  link.style.color = 'var(--jp-content-link-color)';

                  body.appendChild(p1);
                  body.appendChild(link);
                  void showDialog({
                    title: 'Session closed.',
                    body: new Widget({ node: body }),
                    buttons: []
                  });
                } else {
                  throw new ServerConnection.ResponseError(result);
                }
              })
              .catch((error: any) => {
                // Say what happened and where to go instead, rather than
                // leaving the session in a state the user cannot see.
                const body = document.createElement('div');
                const p1 = document.createElement('p');
                p1.textContent =
                  'The session could not be stopped: ' +
                  (error && error.message ? error.message : String(error));

                const baseUrl = new URL(setting.baseUrl);
                const link = document.createElement('a');
                link.href =
                  baseUrl.protocol + '//' + baseUrl.host + '/hub/home';
                link.textContent = 'Stop it from the hub control panel.';
                link.style.color = 'var(--jp-content-link-color)';

                body.appendChild(p1);
                body.appendChild(link);
                void showDialog({
                  title: 'Could not stop the session',
                  body: new Widget({ node: body }),
                  buttons: [Dialog.okButton()]
                });
              });
          }
        });
      }
    });
  }
};

export default plugin;
