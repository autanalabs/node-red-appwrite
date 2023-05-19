
const errors = require('../autana-error');

function addAutanaObjectToMessage(msg, config) {
    if (!msg._autana) {
        msg._autana = {
            'table': {
                'name': config.tableName,
                'enabled': true,
                'attributes': [],
                'indexes': []
            }, 
            'database': {
                'name': config.databaseName
            }
        }
    }
    if (!msg._autana.table.attributes) {
        msg._autana.table.attributes = [];
    }
    if (!msg._autana.table.indexes) {
        msg._autana.table.indexes = [];
    }
}

function addIndexToMessage(index, msg, config) {
    if (!index) {
        index = {
            'name': config.indexName,
            'type': config.indexType,
            'status': "available",
            'columns': config.columns,
            'sorting': config.orders
        };
    } else {
        index.name = index.key;
        delete index.key;
        index.columns = index.attributes;
        delete index.attributes;
        index.sorting = index.orders;
        delete index.orders;
    }
    addAutanaObjectToMessage(msg, config);
    msg._autana.table.indexes.push(index);
}

function onCreateIndexComplete (RED, node, msg, config, response) {
    try {
        msg.payload = response;
        let index = msg.payload;
        addIndexToMessage(index, msg, config);
        node.status({});
        node.send(msg);

    } catch(err) {
        errors.handleError('error creating column', node, err);
    }
}

function onCreateIndexError (RED, node, msg, config, err) {
    msg.payload = {};
    if ((config.skipExists == true) && err.toString().includes("already exists")) {
        try {
            node.status({fill:"yellow",shape:"ring",text:"autanaCloud.warn.index-exists"});
            console.warn(RED._("autanaCloud.warn.index-exists", {err:err}));
            addIndexToMessage(null, msg, config);
            node.send(msg);
        
        } catch(err) {
            errors.handleError('error handling [index already exists] case', node, err);
        }

    } else {
        errors.handleError('error creating index', node, err);
    } 
}

function onDeleteIndexComplete (RED, node, msg, config, response) {
    try {
        msg.payload = response;
        let index = msg.payload;
        node.status({});
        node.send(msg);

    } catch(err) {
        errors.handleError('error deleting index', node, err);
    }
}

function onDeleteIndexError (RED, node, msg, config, err) {
    msg.payload = {};
    if ((config.skipNotFound == true) && err.toString().includes("Index not found")) {
        try {
            node.status({fill:"yellow",shape:"ring",text:"autanaCloud.warn.index-not-found"});
            console.warn(RED._("autanaCloud.warn.index-not-found", {err:err}));
            node.send(msg);
        
        } catch(err) {
            errors.Error('error handling [index not found] case', node, err);
        }

    } else {
        errors.handleError('error deleting index', node, err);
    } 
}

module.exports = { onCreateIndexComplete, onCreateIndexError, 
    onDeleteIndexComplete, onDeleteIndexError };