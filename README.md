
[![clasp](https://img.shields.io/badge/built%20with-clasp-4285f4.svg)](https://github.com/google/clasp)

In [Gmail](https://mail.google.com/), labels attach to individual messages, not whole threads. This means that new arriving messages in a thread will not always be given existing labels unless they are manually reapplied.

To work around this issue, this project uses a [Google Apps Script](https://script.google.com/) to periodically add missing labels to all messages affected.


## Installation

1. Enable the Google Apps Script API at https://script.google.com/home/usersettings
1. Create a new project at https://script.google.com/home
1. Clone or download this repository
   ```sh
   git clone git@github.com:ariasemis/propagate-gmail-label.git
   ```
1. Edit `.clasp.json` file with the `scriptId` of the project you created
1. Push changes to google apps script project
   ```sh
   npm install 
   npx clasp login # access your Google account
   npm run push
   ```
1. Open project on script.google.com and run `install` function

> To stop the script from running you can execute the `uninstall` function provided in the script.


## Settings

The following options can be configured in _Project Settings>Script Properties_:

| Property | Default Value | Description |
| -- | -- | -- |
| DAYS_BETWEEN_RUNS | `1` | Frequency in days at which the script will run |
| TIME_OF_DAY_TO_RUN | `5` | Specifies the hour at which the script runs |
| DRY_RUN | `false` | When `true`, the script will only log results without applying changes to message labels |
| MAX_THREADS_PER_RUN | `20` | Maximum number of message threads to process per run |
| NO_LABEL | `uncategorized` | Name of the label to add to threads without any label |


## Acknowledgements

Inspired by [Tom Scott's post on fixing Gmail labels](https://www.tomscott.com/fix-gmail-labels-threads/).
