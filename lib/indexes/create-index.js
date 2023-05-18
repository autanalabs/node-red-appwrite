
const utils = require('../utils');
const errors = require('../autana-error');
const common = require('./common-indexes');

let requiredProperties = ['databaseName', 'tableName', 'indexName', 'indexType', 'columns'];

let stringWithCommasToArrayTransformation = (it) => it.toString().split(',');

let transformations = {
    columns: stringWithCommasToArrayTransformation,
    orders: stringWithCommasToArrayTransformation
};

function createNode(RED, node, n) {
    console.log('creating CreateIndex node...')
    try {
        RED.nodes.createNode(node, n);
        let staticConfig = n;
        let database = utils.getDatabase();

        node.on("input", function(msg) {
            console.log('CreateIndex.onMessage()');
            try {
                let messageConfig = msg;
                let defaultProperties = {
                    databaseName: utils.getPreviousDatabaseName(msg),
                    tableName: utils.getPreviousTableName(msg),
                    orders: null
                };
                let config = utils.mergeConfigs(staticConfig, messageConfig, defaultProperties, 
                    requiredProperties, transformations);

                utils.notifyExecuting(node);
                let promise = database.createIndex(config.databaseName, config.tableName, 
                    config.indexName, config.indexType,
                    config.columns, config.orders);

                promise.then(
                    function (response) { common.onCreateIndexComplete(RED, node, msg, config, response); },
                    function (err) { common.onCreateIndexError(RED, node, msg, config, err); }
                );

            } catch (err) {
                errors.handleError('error at CreateIndex.onMessage()', node, err);
            }
        });
        
    } catch (error) {
        errors.handleError('error creating CreateIndex node', node, error);
    }
}

module.exports = { createNode };