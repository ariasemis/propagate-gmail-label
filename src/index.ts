const run = () => {
    // TODO: 
    // retrieve script properties
    // search for threads
    // iterate threads
    // get labels applied to thread
    // if no labels, continue with next thread
    // if labels, add them to thread
    // !! remember to check for dry-run and add logs

    Logger.log("not yet implemented...");
}

const install = () => {
    setupPreferences_();
    setupTriggers_();
}

const uninstall = () => {
    var triggers = ScriptApp.getProjectTriggers();

    // TODO: can I replace the "for" with a better loop ?
    // TODO: check function called by trigger matches "run"
    for (let i = 0; i < triggers.length; i++) {
        const trigger = triggers[i];

        // trigger.getHandlerFunction()

        ScriptApp.deleteTrigger(trigger);
        Logger.log("trigger %s deleted", trigger.getUniqueId()); // TODO: review instance is not null here, otherwise move log before deletion
    }
}

// private functions:
// https://developers.google.com/apps-script/guides/html/communication#private_functions

const setupTriggers_ = () => {
    // TODO: check that function called by trigger matches "run"
    var triggers = ScriptApp.getProjectTriggers();
    if (triggers.length > 0) {
        Logger.log("trigger already configured found, skipping installation");
        return;
    }
    
    const properties = PropertiesService.getScriptProperties();
    const hour = parseInt(properties.getProperty('TIME_OF_DAY_TO_RUN'));
    const days = parseInt(properties.getProperty('DAYS_BETWEEN_RUNS'));
    
    ScriptApp
        .newTrigger('run')
        .timeBased()
        .atHour(hour)
        .everyDays(days)
        .create();

    Logger.log("script configured to run every %s days at %s", days, hour);
}

const setupPreferences_ = () => {
    const properties = PropertiesService.getScriptProperties();

    const configure = (key: string, value: string) => {
        if (properties.getProperty(key) == null) {
            properties.setProperty(key, value);
            Logger.log("%s property not found, using default value (%s)", key, value);
        }
    }

    configure('DAYS_BETWEEN_RUNS', '1');
    configure('TIME_OF_DAY_TO_RUN', '5');
    configure('DRY_RUN', 'false');
    configure('MAX_THREADS_PER_RUN', '100');
}

const strToBool_ = (val: string): boolean => JSON.parse(val);
