
const utils = require('../utils');
const errors = require('../autana-error');
const common = require('./common-columns');

let requiredProperties = ['databaseName', 'tableName', 'key'];

function createNode(RED, node, n) {
    console.log('creating BooleanColumn node...')
    try {
        RED.nodes.createNode(node, n);
        let staticConfig = n;
        let database = utils.getDatabase(RED, n);

        node.on("input", function(msg) {
            console.log('BooleanColumn.onMessage()');
            try {
                let messageConfig = msg;
                let defaultProperties = {
                    databaseName: utils.getPreviousDatabaseName(msg),
                    tableName: utils.getPreviousTableName(msg),
                    required: false,
                    isArray: false,
                    defaultValue: null
                };
                let config = utils.mergeConfigs(staticConfig, messageConfig, defaultProperties, requiredProperties);

                utils.notifyExecuting(node);
                let promise = database.createBooleanAttribute(config.databaseName, config.tableName, config.key, 
                    config.required, config.defaultValue, config.isArray);

                promise.then(
                    function (response) { common.onAddColumnComplete(RED, node, msg, config, response); },
                    function (err) { common.onAddColumnError(RED, node, msg, config, err); }
                );

            } catch (err) {
                common.handleError('error at BooleanColumn.onMessage()', node, err);
            }
        });
        
    } catch (error) {
        common.handleError('error creating BooleanColumn node', node, error);
    }
}

module.exports = { createNode };