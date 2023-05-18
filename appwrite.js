/**
 * Copyright 2023 AutanaLabs.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function(RED) {
    "use strict";
    var sdk = require('node-appwrite');

    function isEmpty(str) {
        return (!str || str.length === 0 );
    }

    function getDatabase() {
        var sdk = require('node-appwrite');
        if (!sdk) {
            throw new Error(RED._("autanaCloud.warn.wrong-config"));
        }
        var client = new sdk.Client();
        if (!client) {
            throw new Error(RED._("autanaCloud.warn.missing-client"));
        }
        client
            .setEndpoint("https://cloud.appwrite.io/v1")
            .setProject("autana")
            .setKey("9e49d48d5914598f3d9ade48d058ee1af3e04655793bcab0dca7f0bb5ca0b707b6346d6d9ef5ec2a09de2275c95af95b908a2af3c4d3d3bf508b59ae505c6b3cd45fb5a58f5b43f243fcefded0716269da00d6ca4a6e5400fc926afc8916f4223d55ffbe8842ca3045cd4188dea301ba6c5ba88760e2e5731c274167d28e25b1");
        
        let database = new sdk.Database(client);
        return database;
    }

    function AutanaDataTableReadNode(n) {
        console.log('creating AutanaDataTableReadNode...')
        try {
            RED.nodes.createNode(this, n);
            let databaseName = n.databaseName;
            let nodeTableName = n.tableName;
            let nodeQuery = n.query;
            let node = this;
            let database = getDatabase();

            node.on("input", function(msg) {
                console.log('AutanaDataTableReadNode.onMessage()');
    
                let tableName = nodeTableName || msg.tableName;
                let query = nodeQuery || msg.query;
    
                if (msg.tableName && nodeTableName 
                    && (nodeTableName !== msg.tableName)) {  
                    node.warn(RED._("autanaCloud.error.table-name-overrided"));
                    console.warn(RED._("autanaCloud.error.table-name-overrided"));
                    return;
                }
    
                if (msg.query && nodeQuery 
                    && (nodeQuery !== msg.query)) {  
                    node.warn(RED._("autanaCloud.error.query-overrided"));
                    console.warn(RED._("autanaCloud.error.query-overrided"));
                    return;
                }
    
                node.status({fill:"blue",shape:"dot",text:"autanaCloud.status.reading"});
                let promise = database.listDocuments(databaseName, tableName, isEmpty(query)? null :[query]);
                promise.then(function (response) {
                    msg.payload = response;
                    msg.payload.documents
                        .map(doc => {
                            delete doc.$read;
                            delete doc.$write;
                            delete doc.$collection;
                            return doc;
                        });
                    node.status({});
                    node.send(msg);
                }, function (err) {
                    msg.payload = {};
                    msg.error = err;
                    node.status({fill:"red",shape:"ring",text:"autanaCloud.status.error"});
                    node.error(RED._("autanaCloud.error.failed-to-read-documents", {err:err}));
                    console.error(RED._("autanaCloud.error.failed-to-read-documents", {err:err}));
                    node.send(msg);
                });
            });
            
        } catch (error) {
            node.status({fill:"red",shape:"ring",text:"autanaCloud.status.error"});
            node.error(error);
            console.error(error);
        }
    }

    function AutanaDataTableInsertNode(n) {
        console.log('creating AutanaDataTableInsertNode...')
        try {
            RED.nodes.createNode(this, n);
            let databaseName = n.databaseName;
            let nodeTableName = n.tableName;
            let nodeDocId = n.docId;
            let node = this;
            let database = getDatabase();

            node.on("input", function(msg) {
                console.log('AutanaDataTableInsertNode.onMessage()');
    
                let tableName = nodeTableName || msg.tableName;
                let docId = nodeDocId || msg.docId;
    
                if (msg.tableName && nodeTableName 
                    && (nodeTableName !== msg.tableName)) {  
                    node.warn(RED._("autanaCloud.error.table-name-overrided"));
                    console.warn(RED._("autanaCloud.error.table-name-overrided"));
                    return;
                }
    
                if (msg.docId && nodeDocId 
                    && (nodeDocId !== msg.docId)) {  
                    node.warn(RED._("autanaCloud.error.doc-id-overrided"));
                    console.warn(RED._("autanaCloud.error.doc-id-overrided"));
                    return;
                }
    
                node.status({fill:"blue",shape:"dot",text:"autanaCloud.status.writing"});
                let promise = database.createDocument(databaseName, tableName, isEmpty(docId)? "unique()" : docId, msg.payload);
                promise.then(function (response) {
                    delete response.$read;
                    delete response.$write;
                    delete response.$collection;
                    msg.payload = response;
                    node.status({});
                    node.send(msg);
                }, function (err) {
                    msg.payload = {};
                    msg.error = err;
                    node.status({fill:"red",shape:"ring",text:"autanaCloud.status.error"});
                    node.error(RED._("autanaCloud.error.failed-to-read-documents", {err:err}));
                    console.error(RED._("autanaCloud.error.failed-to-read-documents", {err:err}));
                    node.send(msg);
                });
            });
            
        } catch (error) {
            node.status({fill:"red",shape:"ring",text:"autanaCloud.status.error"});
            node.error(error);
            console.error(error);
        }
    }

    function AutanaDataTableUpdateNode(n) {
        console.log('creating AutanaDataTableUpdateNode...')
        try {
            RED.nodes.createNode(this, n);
            let databaseName = n.databaseName;
            let nodeTableName = n.tableName;
            let nodeDocId = n.docId;
            let node = this;
            let database = getDatabase();

            node.on("input", function(msg) {
                console.log('AutanaDataTableUpdateNode.onMessage()');
    
                let tableName = nodeTableName || msg.tableName;
                let docId = nodeDocId || msg.docId;
    
                if (msg.tableName && nodeTableName 
                    && (nodeTableName !== msg.tableName)) {  
                    node.warn(RED._("autanaCloud.error.table-name-overrided"));
                    console.warn(RED._("autanaCloud.error.table-name-overrided"));
                    return;
                }
    
                if (msg.docId && nodeDocId 
                    && (nodeDocId !== msg.docId)) {  
                    node.warn(RED._("autanaCloud.error.doc-id-overrided"));
                    console.warn(RED._("autanaCloud.error.doc-id-overrided"));
                    return;
                }

                if (isEmpty(docId)) {
                    node.warn(RED._("autanaCloud.error.doc-id-empty"));
                    console.warn(RED._("autanaCloud.error.doc-id-empty"));
                    return;
                }
    
                node.status({fill:"blue",shape:"dot",text:"autanaCloud.status.writing"});
                let promise = database.updateDocument(databaseName, tableName, docId, msg.payload);
                promise.then(function (response) {
                    delete response.$read;
                    delete response.$write;
                    delete response.$collection;
                    msg.payload = response;
                    node.status({});
                    node.send(msg);
                }, function (err) {
                    msg.payload = {};
                    msg.error = err;
                    node.status({fill:"red",shape:"ring",text:"autanaCloud.status.error"});
                    node.error(RED._("autanaCloud.error.failed-to-read-documents", {err:err}));
                    console.error(RED._("autanaCloud.error.failed-to-read-documents", {err:err}));
                    node.send(msg);
                });
            });
            
        } catch (error) {
            node.status({fill:"red",shape:"ring",text:"autanaCloud.status.error"});
            node.error(error);
            console.error(error);
        }
    }

    function AutanaDataTableDeleteNode(n) {
        console.log('creating AutanaDataTableDeleteNode...')
        try {
            RED.nodes.createNode(this, n);
            let databaseName = n.databaseName;
            let nodeTableName = n.tableName;
            let nodeDocId = n.docId;
            let node = this;
            let database = getDatabase();

            node.on("input", function(msg) {
                console.log('AutanaDataTableDeleteNode.onMessage()');
    
                let tableName = nodeTableName || msg.tableName;
                let docId = nodeDocId || msg.docId;
    
                if (msg.tableName && nodeTableName 
                    && (nodeTableName !== msg.tableName)) {  
                    node.warn(RED._("autanaCloud.error.table-name-overrided"));
                    console.warn(RED._("autanaCloud.error.table-name-overrided"));
                    return;
                }
    
                if (msg.docId && nodeDocId 
                    && (nodeDocId !== msg.docId)) {  
                    node.warn(RED._("autanaCloud.error.doc-id-overrided"));
                    console.warn(RED._("autanaCloud.error.doc-id-overrided"));
                    return;
                }

                if (isEmpty(docId)) {
                    node.warn(RED._("autanaCloud.error.doc-id-empty"));
                    console.warn(RED._("autanaCloud.error.doc-id-empty"));
                    return;
                }
    
                node.status({fill:"blue",shape:"dot",text:"autanaCloud.status.writing"});
                let promise = database.deleteDocument(databaseName, tableName, docId);
                promise.then(function (response) {
                    delete response.$read;
                    delete response.$write;
                    delete response.$collection;
                    msg.payload = response;
                    node.status({});
                    node.send(msg);
                }, function (err) {
                    msg.payload = {};
                    msg.error = err;
                    node.status({fill:"red",shape:"ring",text:"autanaCloud.status.error"});
                    node.error(RED._("autanaCloud.error.failed-to-read-documents", {err:err}));
                    console.error(RED._("autanaCloud.error.failed-to-read-documents", {err:err}));
                    node.send(msg);
                });
            });
            
        } catch (error) {
            node.status({fill:"red",shape:"ring",text:"autanaCloud.status.error"});
            node.error(error);
            console.error(error);
        }
    }

    function AutanaDataTableReadSchema(n) {
        console.log('creating AutanaDataTableReadSchemaNode...')
        try {
            RED.nodes.createNode(this, n);
            let databaseName = n.databaseName;
            let nodeTableName = n.tableName;
            let node = this;
            let database = getDatabase();

            node.on("input", function(msg) {
                console.log('AutanaDataTableReadSchemaNode.onMessage()');
    
                let tableName = nodeTableName || msg.tableName;
    
                if (msg.tableName && nodeTableName 
                    && (nodeTableName !== msg.tableName)) {  
                    node.warn(RED._("autanaCloud.error.table-name-overrided"));
                    console.warn(RED._("autanaCloud.error.table-name-overrided"));
                    return;
                }
    
                node.status({fill:"blue",shape:"dot",text:"autanaCloud.status.reading"});
                let promise = database.getCollection(databaseName, tableName);
                promise.then(function (response) {
                    try {
                        msg.payload = response;
                        let table = msg.payload;  
                        table.name = table.$id;
                        delete table.$read;
                        delete table.$write;
                        delete table.$id;
                        delete table.permission;
                        node.status({});
                        node.send(msg);

                    } catch(err) {
                        msg.payload = {};
                        msg.error = err;
                        node.status({fill:"red",shape:"ring",text:"autanaCloud.status.error"});
                        node.error(RED._("autanaCloud.error.failed-to-read-documents", {err:err}));
                        console.error(RED._("autanaCloud.error.failed-to-read-documents", {err:err}));
                        node.send(msg);
                    }
                }, function (err) {
                    msg.payload = {};
                    msg.error = err;
                    node.status({fill:"red",shape:"ring",text:"autanaCloud.status.error"});
                    node.error(RED._("autanaCloud.error.failed-to-read-documents", {err:err}));
                    console.error(RED._("autanaCloud.error.failed-to-read-documents", {err:err}));
                    node.send(msg);
                });
            });
            
        } catch (error) {
            node.status({fill:"red",shape:"ring",text:"autanaCloud.status.error"});
            node.error(error);
            console.error(error);
        }
    }

    function AutanaDataTableListTables(n) {
        console.log('creating AutanaDataTableReadSchemaNode...')
        try {
            RED.nodes.createNode(this, n);
            let databaseName = n.databaseName;
            let nodeTableName = n.tableName;
            let node = this;
            let database = getDatabase();

            node.on("input", function(msg) {
                console.log('AutanaDataTableReadSchemaNode.onMessage()');
    
                let tableName = nodeTableName || msg.tableName;
    
                if (msg.tableName && nodeTableName 
                    && (nodeTableName !== msg.tableName)) {  
                    node.warn(RED._("autanaCloud.error.table-name-overrided"));
                    console.warn(RED._("autanaCloud.error.table-name-overrided"));
                    return;
                }
    
                node.status({fill:"blue",shape:"dot",text:"autanaCloud.status.reading"});
                let promise = database.listCollections(databaseName, isEmpty(tableName)? null : tableName);
                promise.then(function (response) {
                    try {
                        msg.payload = response;
                        msg.payload.tables = msg.payload.collections;
                        delete msg.payload.collections;
                        msg.payload.tables.map(table => {
                            table.name = table.$id;
                            delete table.$read;
                            delete table.$write;
                            delete table.$id;
                            delete table.permission;
                            delete table.attributes;
                            delete table.indexes;
                        });
                        node.status({});
                        node.send(msg);

                    } catch(err) {
                        msg.payload = {};
                        msg.error = err;
                        node.status({fill:"red",shape:"ring",text:"autanaCloud.status.error"});
                        node.error(RED._("autanaCloud.error.failed-to-read-documents", {err:err}));
                        console.error(RED._("autanaCloud.error.failed-to-read-documents", {err:err}));
                        node.send(msg);
                    }
                }, function (err) {
                    msg.payload = {};
                    msg.error = err;
                    node.status({fill:"red",shape:"ring",text:"autanaCloud.status.error"});
                    node.error(RED._("autanaCloud.error.failed-to-read-documents", {err:err}));
                    console.error(RED._("autanaCloud.error.failed-to-read-documents", {err:err}));
                    node.send(msg);
                });
            });
            
        } catch (error) {
            node.status({fill:"red",shape:"ring",text:"autanaCloud.status.error"});
            node.error(error);
            console.error(error);
        }
    }

    function AutanaDataTableCreateTable(n) {
        console.log('creating AutanaDataTableReadSchemaNode...')
        try {
            RED.nodes.createNode(this, n);
            let databaseName = n.databaseName;
            let nodeTableName = n.tableName;
            let nodeSkipExists = n.skipExists;
            let node = this;
            let database = getDatabase();

            node.on("input", function(msg) {
                console.log('AutanaDataTableReadSchemaNode.onMessage()');
    
                let tableName = nodeTableName || msg.tableName;
    
                if (msg.tableName && nodeTableName 
                    && (nodeTableName !== msg.tableName)) {  
                    node.warn(RED._("autanaCloud.error.table-name-overrided"));
                    console.warn(RED._("autanaCloud.error.table-name-overrided"));
                    return;
                }

                let skipExists = nodeSkipExists || msg.skipExists || false;

                if (msg.skipExists && nodeSkipExists 
                    && (nodeSkipExists !== msg.skipExists)) {  
                    node.warn(RED._("autanaCloud.error.table-name-overrided"));
                    console.warn(RED._("autanaCloud.error.table-name-overrided"));
                    return;
                }
    
                node.status({fill:"blue",shape:"dot",text:"autanaCloud.status.reading"});
                let promise = database.createCollection(databaseName, tableName, tableName, "collection", [], []);
                promise.then(function (response) {
                    try {
                        msg.payload = response;
                        let table = msg.payload;  
                        table.name = table.$id;
                        delete table.$read;
                        delete table.$write;
                        delete table.$id;
                        delete table.permission;
                        msg._autana = {
                            'table' : table
                        }
                        node.status({});
                        node.send(msg);

                    } catch(err) {
                        msg.payload = {};
                        node.status({fill:"red",shape:"ring",text:"autanaCloud.status.error"});
                        node.error(RED._("autanaCloud.error.failed-to-read-documents", {err:err}));
                        console.error(RED._("autanaCloud.error.failed-to-read-documents", {err:err}));
                    }
                }, function (err) {
                    msg.payload = {};
                    if ((skipExists == true) && err.toString().includes("already exists")) {
                        node.status({fill:"yellow",shape:"ring",text:"autanaCloud.warn.table-exists"});
                        msg._autana = {
                            'table': {
                                'name': tableName,
                                'enabled': true,
                                'attributes': [],
                                'indexes': []
                            }
                        }
                        node.send(msg);

                    } else {
                        node.status({fill:"red",shape:"ring",text:"autanaCloud.status.error"});
                        node.error(RED._("autanaCloud.error.failed-to-read-documents", {err:err}));
                        console.error(RED._("autanaCloud.error.failed-to-read-documents", {err:err}));
                    } 
                });
            });
            
        } catch (error) {
            node.status({fill:"red",shape:"ring",text:"autanaCloud.status.error"});
            node.error(error);
            console.error(error);
        }
    }
    
    RED.nodes.registerType("read table", AutanaDataTableReadNode);
    RED.nodes.registerType("insert row", AutanaDataTableInsertNode);
    RED.nodes.registerType("update row", AutanaDataTableUpdateNode);
    RED.nodes.registerType("delete row", AutanaDataTableDeleteNode);
    RED.nodes.registerType("read schema", AutanaDataTableReadSchema);
    RED.nodes.registerType("list tables", AutanaDataTableListTables);
    RED.nodes.registerType("create table", AutanaDataTableCreateTable);
   

    const columns = require('./lib/columns');
    const indexes = require('./lib/indexes');

    RED.nodes.registerType("add String Column", function (n) {
        columns.StringColumn.createNode(RED, this, n);
    });

    RED.nodes.registerType("add Integer Column", function (n) {
        columns.IntegerColumn.createNode(RED, this, n);
    });

    RED.nodes.registerType("add Float Column", function (n) {
        columns.FloatColumn.createNode(RED, this, n);
    });

    RED.nodes.registerType("add Boolean Column", function (n) {
        columns.BooleanColumn.createNode(RED, this, n);
    });

    RED.nodes.registerType("delete Column", function (n) {
        columns.DeleteColumn.createNode(RED, this, n);
    });

    RED.nodes.registerType("create Index", function (n) {
        indexes.CreateIndex.createNode(RED, this, n);
    });

    RED.nodes.registerType("delete Index", function (n) {
        indexes.DeleteIndex.createNode(RED, this, n);
    });
    
};
