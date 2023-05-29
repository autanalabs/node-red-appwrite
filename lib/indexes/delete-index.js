
const utils = require('../utils');
const errors = require('../autana-error');
const common = require('./common-indexes');

let requiredProperties = ['databaseName', 'tableName', 'indexName'];

function createNode(RED, node, n) {
    console.log('creating DeleteIndex node...')
    try {
        RED.nodes.createNode(node, n);
        let staticConfig = n;

        node.on("input", function(msg) {
            let database = utils.getDatabase(RED, n, msg);
            console.log('DeleteIndex.onMessage()');
            try {
                let messageConfig = msg;
                let defaultProperties = {
                    databaseName: utils.getPreviousDatabaseName(msg),
                    tableName: utils.getPreviousTableName(msg),
                    skipNotFound: false
                };
                let config = utils.mergeConfigs(staticConfig, messageConfig, defaultProperties, 
                    requiredProperties, null);

                utils.notifyExecuting(node);
                let promise = database.deleteIndex(config.databaseName, config.tableName, config.indexName);

                promise.then(
                    function (response) { common.onDeleteIndexComplete(RED, node, msg, config, response); },
                    function (err) { common.onDeleteIndexError(RED, node, msg, config, err); }
                );

            } catch (err) {
                errors.handleError('error at DeleteIndex.onMessage()', node, err);
            }
        });
        
    } catch (error) {
        errors.handleError('error creating DeleteIndex node', node, error);
    }
}

module.exports = { createNode };