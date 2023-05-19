
const utils = require('../utils');
const errors = require('../autana-error');
const common = require('./common-columns');

let requiredProperties = ['databaseName', 'tableName', 'key'];

function createNode(RED, node, n) {
    console.log('creating FloatColumn node...')
    try {
        RED.nodes.createNode(node, n);
        let staticConfig = n;
        let database = utils.getDatabase(RED, n);

        node.on("input", function(msg) {
            console.log('FloatColumn.onMessage()');
            try {
                let messageConfig = msg;
                let defaultProperties = {
                    databaseName: utils.getPreviousDatabaseName(msg),
                    tableName: utils.getPreviousTableName(msg),
                    required: false,
                    isArray: false,
                    min: null,
                    max: null,
                    defaultValue: null
                };
                let config = utils.mergeConfigs(staticConfig, messageConfig, defaultProperties, requiredProperties);

                utils.notifyExecuting(node);
                let promise = database.createFloatAttribute(config.databaseName, config.tableName, config.key, 
                    config.required, config.min, config.max, config.defaultValue, config.isArray);

                promise.then(
                    function (response) { common.onAddColumnComplete(RED, node, msg, config, response); },
                    function (err) { common.onAddColumnError(RED, node, msg, config, err); }
                );

            } catch (err) {
                common.handleError('error at FloatColumn.onMessage()', node, err);
            }
        });
        
    } catch (error) {
        common.handleError('error creating FloatColumn node', node, error);
    }
}

module.exports = { createNode };