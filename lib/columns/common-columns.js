
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
}

function addColumnToMessage(column, msg, config) {
    if (!column) {
        column = {
            'key': config.key,
            'type': "string",
            'status': "available",
            'required': config.required,
            'array': config.isArray,
            'size': config.size,
            'default': config.defaultValue,
        };
    }
    addAutanaObjectToMessage(msg, config);
    msg._autana.table.attributes.push(column);
}

function onAddColumnComplete (RED, node, msg, config, response) {
    try {
        msg.payload = response;
        let column = msg.payload;
        addColumnToMessage(column, msg, config);
        node.status({});
        node.send(msg);

    } catch(err) {
        handleError('error creating column', node, err);
    }
}

function onAddColumnError (RED, node, msg, config, err) {
    msg.payload = {};
    if ((config.skipExists == true) && err.toString().includes("already exists")) {
        try {
            node.status({fill:"yellow",shape:"ring",text:"autanaCloud.warn.column-exists"});
            console.warn(RED._("autanaCloud.warn.column-exists", {err:err}));
            addColumnToMessage(null, msg, config);
            node.send(msg);
        
        } catch(err) {
            handleError('error handling [column already exists] case', node, err);
        }

    } else {
        handleError('error creating column', node, err);
    } 
}

function onDeleteColumnComplete (RED, node, msg, config, response) {
    try {
        msg.payload = response;
        let column = msg.payload;
        node.status({});
        node.send(msg);

    } catch(err) {
        handleError('error deleting column', node, err);
    }
}

function onDeleteColumnError (RED, node, msg, config, err) {
    msg.payload = {};
    if ((config.skipNotFound == true) && err.toString().includes("Attribute not found")) {
        try {
            node.status({fill:"yellow",shape:"ring",text:"autanaCloud.warn.column-not-found"});
            console.warn(RED._("autanaCloud.warn.column-not-found", {err:err}));
            node.send(msg);
        
        } catch(err) {
            handleError('error handling [column not found] case', node, err);
        }

    } else {
        handleError('error deleting column', node, err);
    } 
}

function handleError (message, node, err, ) {
    console.error(message);
    console.error(err);
    node.status({fill:"red",shape:"ring",text:"autanaCloud.status.error"});
    node.error(err);
}

module.exports = { handleError, onAddColumnComplete, onAddColumnError, 
    onDeleteColumnComplete, onDeleteColumnError };