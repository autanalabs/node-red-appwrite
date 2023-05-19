
const utils = require('../utils');
const errors = require('../autana-error');
const common = require('./common-columns');

let requiredProperties = ['databaseName', 'tableName', 'key'];

function createNode(RED, node, n) {
    console.log('creating DeleteColumn node...')
    try {
        RED.nodes.createNode(node, n);
        let staticConfig = n;
        let database = utils.getDatabase(RED, n);

        node.on("input", function(msg) {
            console.log('DeleteColumn.onMessage()');
            try {
                let messageConfig = msg;
                let defaultProperties = {
                    databaseName: utils.getPreviousDatabaseName(msg),
                    tableName: utils.getPreviousTableName(msg),
                    skipNotFound: false
                };
                let config = utils.mergeConfigs(staticConfig, messageConfig, defaultProperties, requiredProperties);

                utils.notifyExecuting(node);
                let promise = database.deleteAttribute(config.databaseName, config.tableName, config.key);

                promise.then(
                    function (response) { common.onDeleteColumnComplete(RED, node, msg, config, response); },
                    function (err) { common.onDeleteColumnError(RED, node, msg, config, err); }
                );

            } catch (err) {
                common.handleError('error at DeleteColumn.onMessage()', node, err);
            }
        });
        
    } catch (error) {
        common.handleError('error creating DeleteColumn node', node, error);
    }
}

module.exports = { createNode };