const run = () => {
    const runProps = getRunProperties_();
    if (runProps == null) {
        Logger.log("run interrupted due to missing configurations");
        return;
    }

    const { dryRun, pageSize, noLabel } = runProps;
    const missingLabel = getOrCreateLabel_(noLabel);

    const query = `has:nouserlabels -in:inbox -in:draft -label:${noLabel}`;
    const threads = GmailApp.search(query, 0, pageSize);

    for (const thread of threads) {

        if (thread.isInInbox()) {
            Logger.log("thread='%s' is in inbox, skipped", thread.getFirstMessageSubject());
            continue;
        }
        
        const labels = thread.getLabels();
        const labelsToAdd = labels.length === 0 ? [ missingLabel ] : labels;
        
        if (!dryRun) {
            for (const label of labelsToAdd) {
                thread.addLabel(label);
            }
        }
        Logger.log(
            "thread='%s' was updated with labels %s. (dry-run=%s)", 
            thread.getFirstMessageSubject(), 
            labelsToAdd.map(x => x.getName()), 
            dryRun);
    }
}

const install = () => {
    setupPreferences_();
    setupTriggers_();
}

const uninstall = () => {
    var triggers = ScriptApp.getProjectTriggers();

    for (let i = 0; i < triggers.length; i++) {
        const trigger = triggers[i];

        ScriptApp.deleteTrigger(trigger);
        Logger.log("trigger %s deleted", trigger.getUniqueId());
    }
}

// private functions:
// https://developers.google.com/apps-script/guides/html/communication#private_functions

const getOrCreateLabel_ = (labelName: string) => {
    let label = GmailApp.getUserLabelByName(labelName);
    if (!label) {
        // TODO: when doing a dry-run, we are still creating the label which is not ideal
        label = GmailApp.createLabel(labelName);
        Logger.log("%s label created in gmail", labelName);
    }
    return label;
}

const getRunProperties_ = () => {
    const properties = PropertiesService.getScriptProperties();
    
    const runProps = {
        dryRun: strToBool_(properties.getProperty('DRY_RUN')),
        pageSize: parseInt(properties.getProperty('MAX_THREADS_PER_RUN')),
        noLabel: properties.getProperty('NO_LABEL')
    };

    if (runProps.pageSize == null || isNaN(runProps.pageSize)) {
        Logger.log("'MAX_THREADS_PER_RUN' property not configured");
        return null;
    }

    if (!runProps.noLabel) {
        Logger.log("'NO_LABEL' property not configured");
        return null;
    }
    
    return runProps;
}

const setupTriggers_ = () => {
    var triggers = ScriptApp.getProjectTriggers();
    if (triggers.length > 0) {
        Logger.log("trigger already configured, skipping installation");
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
    configure('MAX_THREADS_PER_RUN', '20');
    configure('NO_LABEL', 'uncategorized');
}

const strToBool_ = (val: string): boolean => ["true", "True", "1", "TRUE"].includes(val);
