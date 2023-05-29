
const utils = require('../utils');
const errors = require('../autana-error');
const common = require('./common-columns');

let requiredProperties = ['databaseName', 'tableName', 'key'];

function createNode(RED, node, n) {
    console.log('creating StringColumn node...')
    try {
        RED.nodes.createNode(node, n);
        let staticConfig = n;

        node.on("input", function(msg) {
            let database = utils.getDatabase(RED, n, msg);
            console.log('StringColumn.onMessage()');
            try {
                let messageConfig = msg;
                let defaultProperties = {
                    databaseName: utils.getPreviousDatabaseName(msg),
                    tableName: utils.getPreviousTableName(msg),
                    required: false,
                    isArray: false,
                    size: 255
                };
                let config = utils.mergeConfigs(staticConfig, messageConfig, defaultProperties, requiredProperties);

                utils.notifyExecuting(node);
                let promise = database.createStringAttribute(config.databaseName, config.tableName, config.key, 
                    config.size, config.required, config.defaultValue, config.isArray);

                promise.then(
                    function (response) { common.onAddColumnComplete(RED, node, msg, config, response); },
                    function (err) { common.onAddColumnError(RED, node, msg, config, err); }
                );

            } catch (err) {
                common.handleError('error at StringColumn.onMessage()', node, err);
            }
        });
        
    } catch (error) {
        common.handleError('error creating StringColumn node', node, error);
    }
}

module.exports = { createNode };