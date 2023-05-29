
const errors = require('./autana-error');


function isEmpty(str) {
    return (!str || str.length === 0 );
}

function getDatabase(RED, n, msg) {

    var appwriteConfig;

    if (msg.endpoint && msg.project && msg.apiKey) {

        appwriteConfig = {
            params: {
                endpoint: msg.endpoint,
                project: msg.project,
                apiKey: msg.apiKey
            }
        };


    } else {
        if (n.appwriteConfig) {
            appwriteConfig = RED.nodes.getNode(n.appwriteConfig);
        }
    }

    if (!appwriteConfig) {
        node.warn(RED._("appwrite.warn.missing-config"));
        console.warn(RED._("appwrite.warn.missing-config"));
        return;
    }

    var sdk = require('node-appwrite');
    if (!sdk) {
        throw new Error(RED._("autanaCloud.warn.wrong-config"));
    }
    var client = new sdk.Client();
    if (!client) {
        throw new Error(RED._("autanaCloud.warn.missing-client"));
    }
    client
        .setEndpoint(appwriteConfig.params.endpoint)
        .setProject(appwriteConfig.params.project)
        .setKey(appwriteConfig.params.apiKey);

    let database = new sdk.Databases(client);
    return database;
}

function notifyExecuting(node) {
    node.status({fill:"blue",shape:"dot",text:"autanaCloud.status.executing"});
}

function setNullOnEmptyString(value) {
    if (typeof(value) == "string" && isEmpty(value)) {
        return null;

    } else {
        return value;
    }
}

function mergeConfigs(staticConfig, messageConfig, defaultValues, required, transformations) {
    let mergedConfig = {};
    for (const property in staticConfig) {
        let staticProperty = setNullOnEmptyString(staticConfig[property]);
        let messageProperty = setNullOnEmptyString(messageConfig[property]);
        let mergedProperty = messageProperty != null ? messageProperty :
            staticProperty != null ? staticProperty :
                defaultValues[property] != null ? defaultValues[property] : null;
        
        if (required.includes(property) && mergedProperty == null) {
            throw new errors.AutanaError('Required either config.' + property + ' or msg.' + property);
        }
        if (transformations && transformations[property] != null) {
            mergedProperty = transformations[property](mergedProperty);
        }
        mergedConfig[property] = mergedProperty;
    }
    return mergedConfig;
}

function getPreviousTableName(msg) {
    if (msg && msg._autana && msg._autana.table) {
        return msg._autana.table.name;
    } else {
        return null;
    }
}

function getPreviousDatabaseName(msg) {
    if (msg && msg._autana && msg._autana.database) {
        return msg._autana.database.name;
    } else {
        return null;
    }
}

module.exports = { isEmpty, getDatabase, mergeConfigs, 
    getPreviousTableName, getPreviousDatabaseName, notifyExecuting };