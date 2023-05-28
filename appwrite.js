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

module.exports = function (RED) {
    "use strict";
    var sdk = require('node-appwrite');

    function isEmpty(str) {
        return (!str || str.length === 0);
    }

    function getDatabase(n, msg) {

        var appwriteConfig;

        if (msg.endpoint && msg.projectId && msg.apiKey) {

            appwriteConfig = {
                params: {
                    endpoint: msg.endpoint,
                    projectId: msg.projectId,
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

    function AutanaDataTableReadNode(n) {
        console.log('creating AutanaDataTableReadNode...')
        try {
            RED.nodes.createNode(this, n);
            let nodeDatabaseName = n.databaseName;
            let nodeTableName = n.tableName;
            let nodeQuery = n.query;
            let node = this;

            node.on("input", function (msg) {
                let database = getDatabase(n, msg);
                console.log('AutanaDataTableReadNode.onMessage()');

                let tableName = msg.tableName || nodeTableName;
                let query = msg.query || nodeQuery;
                let databaseName = msg.databaseName || nodeDatabaseName;


                node.status({ fill: "blue", shape: "dot", text: "autanaCloud.status.reading" });
                let promise = database.listDocuments(databaseName, tableName,
                    isEmpty(query) ? null : Array.isArray(query) ? query : [query]);
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
                    node.status({ fill: "red", shape: "ring", text: "autanaCloud.status.error" });
                    node.error(RED._("autanaCloud.error.failed-to-read-documents", { err: err }));
                    console.error(RED._("autanaCloud.error.failed-to-read-documents", { err: err }));
                    node.send(msg);
                });
            });

        } catch (error) {
            node.status({ fill: "red", shape: "ring", text: "autanaCloud.status.error" });
            node.error(error);
            console.error(error);
        }
    }

    function AutanaDataTableInsertNode(n) {
        console.log('creating AutanaDataTableInsertNode...')
        try {
            RED.nodes.createNode(this, n);
            let nodeDatabaseName = n.databaseName;
            let nodeTableName = n.tableName;
            let nodeDocId = n.docId;
            let node = this;

            node.on("input", function (msg) {
                let database = getDatabase(n, msg);
                console.log('AutanaDataTableInsertNode.onMessage()');

                let tableName = msg.tableName || nodeTableName;
                let docId = msg.docId || nodeDocId;
                let databaseName = msg.databaseName || nodeDatabaseName;

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

                node.status({ fill: "blue", shape: "dot", text: "autanaCloud.status.writing" });
                let promise = database.createDocument(databaseName, tableName, isEmpty(docId) ? "unique()" : docId, msg.payload);
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
                    node.status({ fill: "red", shape: "ring", text: "autanaCloud.status.error" });
                    node.error(RED._("autanaCloud.error.failed-to-read-documents", { err: err }));
                    console.error(RED._("autanaCloud.error.failed-to-read-documents", { err: err }));
                    node.send(msg);
                });
            });

        } catch (error) {
            node.status({ fill: "red", shape: "ring", text: "autanaCloud.status.error" });
            node.error(error);
            console.error(error);
        }
    }

    function AutanaDataTableUpdateNode(n) {
        console.log('creating AutanaDataTableUpdateNode...')
        try {
            RED.nodes.createNode(this, n);
            let nodeDatabaseName = n.databaseName;
            let nodeTableName = n.tableName;
            let nodeDocId = n.docId;
            let node = this;

            node.on("input", function (msg) {
                let database = getDatabase(n, msg);
                console.log('AutanaDataTableUpdateNode.onMessage()');

                let tableName = msg.tableName || nodeTableName;
                let docId = msg.docId || nodeDocId;
                let databaseName = msg.databaseName || nodeDatabaseName;

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

                node.status({ fill: "blue", shape: "dot", text: "autanaCloud.status.writing" });
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
                    node.status({ fill: "red", shape: "ring", text: "autanaCloud.status.error" });
                    node.error(RED._("autanaCloud.error.failed-to-read-documents", { err: err }));
                    console.error(RED._("autanaCloud.error.failed-to-read-documents", { err: err }));
                    node.send(msg);
                });
            });

        } catch (error) {
            node.status({ fill: "red", shape: "ring", text: "autanaCloud.status.error" });
            node.error(error);
            console.error(error);
        }
    }

    function AutanaDataTableDeleteNode(n) {
        console.log('creating AutanaDataTableDeleteNode...')
        try {
            RED.nodes.createNode(this, n);
            let nodeDatabaseName = n.databaseName;
            let nodeTableName = n.tableName;
            let nodeDocId = n.docId;
            let node = this;

            node.on("input", function (msg) {
                let database = getDatabase(n, msg);
                console.log('AutanaDataTableDeleteNode.onMessage()');

                let tableName = msg.tableName || nodeTableName;
                let docId = msg.docId || nodeDocId;
                let databaseName = msg.databaseName || nodeDatabaseName;

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

                node.status({ fill: "blue", shape: "dot", text: "autanaCloud.status.writing" });
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
                    node.status({ fill: "red", shape: "ring", text: "autanaCloud.status.error" });
                    node.error(RED._("autanaCloud.error.failed-to-read-documents", { err: err }));
                    console.error(RED._("autanaCloud.error.failed-to-read-documents", { err: err }));
                    node.send(msg);
                });
            });

        } catch (error) {
            node.status({ fill: "red", shape: "ring", text: "autanaCloud.status.error" });
            node.error(error);
            console.error(error);
        }
    }

    function AutanaDataTableReadSchema(n) {
        console.log('creating AutanaDataTableReadSchemaNode...')
        try {
            RED.nodes.createNode(this, n);
            let nodeDatabaseName = n.databaseName;
            let nodeTableName = n.tableName;
            let node = this;

            node.on("input", function (msg) {
                let database = getDatabase(n, msg);
                console.log('AutanaDataTableReadSchemaNode.onMessage()');

                let tableName = msg.tableName || nodeTableName;
                let databaseName = msg.databaseName || nodeDatabaseName;

                if (msg.tableName && nodeTableName
                    && (nodeTableName !== msg.tableName)) {
                    node.warn(RED._("autanaCloud.error.table-name-overrided"));
                    console.warn(RED._("autanaCloud.error.table-name-overrided"));
                    return;
                }

                node.status({ fill: "blue", shape: "dot", text: "autanaCloud.status.reading" });
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

                    } catch (err) {
                        msg.payload = {};
                        msg.error = err;
                        node.status({ fill: "red", shape: "ring", text: "autanaCloud.status.error" });
                        node.error(RED._("autanaCloud.error.failed-to-read-documents", { err: err }));
                        console.error(RED._("autanaCloud.error.failed-to-read-documents", { err: err }));
                        node.send(msg);
                    }
                }, function (err) {
                    msg.payload = {};
                    msg.error = err;
                    node.status({ fill: "red", shape: "ring", text: "autanaCloud.status.error" });
                    node.error(RED._("autanaCloud.error.failed-to-read-documents", { err: err }));
                    console.error(RED._("autanaCloud.error.failed-to-read-documents", { err: err }));
                    node.send(msg);
                });
            });

        } catch (error) {
            node.status({ fill: "red", shape: "ring", text: "autanaCloud.status.error" });
            node.error(error);
            console.error(error);
        }
    }

    function AutanaDataTableListTables(n) {
        console.log('creating AutanaDataTableListTablesNode...')
        try {
            RED.nodes.createNode(this, n);
            let nodeDatabaseName = n.databaseName;
            let nodeTableName = n.tableName;
            let node = this;

            node.on("input", function (msg) {
                let database = getDatabase(n, msg);
                console.log('AutanaDataTableListTablesNode.onMessage()');

                let tableName = msg.tableName || nodeTableName;
                let databaseName = msg.databaseName || nodeDatabaseName;

                if (msg.tableName && nodeTableName
                    && (nodeTableName !== msg.tableName)) {
                    node.warn(RED._("autanaCloud.error.table-name-overrided"));
                    console.warn(RED._("autanaCloud.error.table-name-overrided"));
                    return;
                }

                node.status({ fill: "blue", shape: "dot", text: "autanaCloud.status.reading" });
                let promise = database.listCollections(databaseName, isEmpty(tableName) ? null : tableName);
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

                    } catch (err) {
                        msg.payload = {};
                        msg.error = err;
                        node.status({ fill: "red", shape: "ring", text: "autanaCloud.status.error" });
                        node.error(RED._("autanaCloud.error.failed-to-read-documents", { err: err }));
                        console.error(RED._("autanaCloud.error.failed-to-read-documents", { err: err }));
                        node.send(msg);
                    }
                }, function (err) {
                    msg.payload = {};
                    msg.error = err;
                    node.status({ fill: "red", shape: "ring", text: "autanaCloud.status.error" });
                    node.error(RED._("autanaCloud.error.failed-to-read-documents", { err: err }));
                    console.error(RED._("autanaCloud.error.failed-to-read-documents", { err: err }));
                    node.send(msg);
                });
            });

        } catch (error) {
            node.status({ fill: "red", shape: "ring", text: "autanaCloud.status.error" });
            node.error(error);
            console.error(error);
        }
    }

    function AutanaDataTableCreateTable(n) {
        console.log('creating AutanaDataTableCreateTableNode...')
        try {
            RED.nodes.createNode(this, n);
            let nodeDatabaseName = n.databaseName;
            let nodeTableName = n.tableName;
            let nodeSkipExists = n.skipExists;
            let node = this;

            node.on("input", function (msg) {
                let database = getDatabase(n, msg);
                console.log('AutanaDataTableCreateTable.onMessage()');

                let tableName = msg.tableName || nodeTableName;
                let databaseName = msg.databaseName || nodeDatabaseName;

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

                const { Permission, Role } = require('node-appwrite');

                node.status({ fill: "blue", shape: "dot", text: "autanaCloud.status.reading" });
                let promise = database.createCollection(databaseName, tableName, tableName, [
                    Permission.read(Role.any()),
                    Permission.update(Role.any()),
                    Permission.delete(Role.any()),
                ], false);
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
                            'table': table
                        }
                        node.status({});
                        node.send(msg);

                    } catch (err) {
                        msg.payload = {};
                        node.status({ fill: "red", shape: "ring", text: "autanaCloud.status.error" });
                        node.error(RED._("autanaCloud.error.failed-to-read-documents", { err: err }));
                        console.error(RED._("autanaCloud.error.failed-to-read-documents", { err: err }));
                    }
                }, function (err) {
                    msg.payload = {};
                    if ((skipExists == true) && err.toString().includes("already exists")) {
                        node.status({ fill: "yellow", shape: "ring", text: "autanaCloud.warn.table-exists" });
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
                        node.status({ fill: "red", shape: "ring", text: "autanaCloud.status.error" });
                        node.error(RED._("autanaCloud.error.failed-to-read-documents", { err: err }));
                        console.error(RED._("autanaCloud.error.failed-to-read-documents", { err: err }));
                    }
                });
            });

        } catch (error) {
            node.status({ fill: "red", shape: "ring", text: "autanaCloud.status.error" });
            node.error(error);
            console.error(error);
        }
    }

    function AutanaDataTableDeleteTable(n) {
        console.log('creating AutanaDataTableDeleteTableNode...')
        try {
            RED.nodes.createNode(this, n);
            let nodeDatabaseName = n.databaseName;
            let nodeTableName = n.tableName;
            let nodeSkipNotFound = n.skipNotFound;
            let node = this;

            node.on("input", function (msg) {
                let database = getDatabase(n, msg);
                console.log('AutanaDataTableDeleteTable.onMessage()');

                let tableName = msg.tableName || nodeTableName;
                let databaseName = msg.databaseName || nodeDatabaseName;

                if (msg.tableName && nodeTableName
                    && (nodeTableName !== msg.tableName)) {
                    node.warn(RED._("autanaCloud.error.table-name-overrided"));
                    console.warn(RED._("autanaCloud.error.table-name-overrided"));
                    return;
                }

                let skipNotFound = nodeSkipNotFound || msg.nodeSkipNotFound || false;

                if (msg.skipNotFound && nodeSkipNotFound
                    && (nodeSkipNotFound !== msg.nodeSkipNotFound)) {
                    node.warn(RED._("autanaCloud.error.table-name-overrided"));
                    console.warn(RED._("autanaCloud.error.table-name-overrided"));
                    return;
                }


                node.status({ fill: "blue", shape: "dot", text: "autanaCloud.status.reading" });
                let promise = database.deleteCollection(databaseName, tableName);
                promise.then(function (response) {
                    try {
                        msg.payload = response;
                        msg._autana = {
                            'table': tableName
                        }
                        node.status({});
                        node.send(msg);

                    } catch (err) {
                        msg.payload = {};
                        node.status({ fill: "red", shape: "ring", text: "autanaCloud.status.error" });
                        node.error(RED._("autanaCloud.error.failed-to-read-documents", { err: err }));
                        console.error(RED._("autanaCloud.error.failed-to-read-documents", { err: err }));
                    }
                }, function (err) {
                    msg.payload = {};
                    if ((skipNotFound == true) && err.toString().includes("not found")) {
                        node.status({ fill: "yellow", shape: "ring", text: "autanaCloud.warn.table-exists" });
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
                        node.status({ fill: "red", shape: "ring", text: "autanaCloud.status.error" });
                        node.error(RED._("autanaCloud.error.failed-to-read-documents", { err: err }));
                        console.error(RED._("autanaCloud.error.failed-to-read-documents", { err: err }));
                    }
                });
            });

        } catch (error) {
            node.status({ fill: "red", shape: "ring", text: "autanaCloud.status.error" });
            node.error(error);
            console.error(error);
        }
    }

    class AppwriteClientParams {
        constructor(project, endpoint, apiKey) {
            this.project = project;
            this.endpoint = endpoint;
            this.apiKey = apiKey;
            Object.freeze(this);
        }
    }

    function AppwriteSdkConfig(n) {
        //console.log('creating AppwriteSdkConfig node...');
        //console.log(JSON.stringify(n));
        RED.nodes.createNode(this, n);
        //console.log(JSON.stringify(this));
        var node = this;

        if (n.endpoint &&
            n.project &&
            n.apikey) {
            this.params = new AppwriteClientParams(n.project, n.endpoint, n.apikey);
            //console.log('AppwriteSdkConfig setup successfully');
        } else {
            node.warn(RED._("appwrite.warn.incomplete-config"));
            console.warn(RED._("appwrite.warn.incomplete-config"));
        }
    }

    RED.nodes.registerType("appwrite-config", AppwriteSdkConfig, {
        endpoint: { type: "text" },
        project: { type: "text" },
        apikey: { type: "text" }
    });

    RED.nodes.registerType("com.autana.readTable", AutanaDataTableReadNode);
    RED.nodes.registerType("com.autana.insertRow", AutanaDataTableInsertNode);
    RED.nodes.registerType("com.autana.updateRow", AutanaDataTableUpdateNode);
    RED.nodes.registerType("com.autana.deleteRow", AutanaDataTableDeleteNode);
    RED.nodes.registerType("com.autana.readSchema", AutanaDataTableReadSchema);
    RED.nodes.registerType("com.autana.listTables", AutanaDataTableListTables);
    RED.nodes.registerType("com.autana.createTable", AutanaDataTableCreateTable);
    RED.nodes.registerType("com.autana.deleteTable", AutanaDataTableDeleteTable);


    const columns = require('./lib/columns');
    const indexes = require('./lib/indexes');

    RED.nodes.registerType("com.autana.StringColumn", function (n) {
        columns.StringColumn.createNode(RED, this, n);
    });

    RED.nodes.registerType("com.autana.IntegerColumn", function (n) {
        columns.IntegerColumn.createNode(RED, this, n);
    });

    RED.nodes.registerType("com.autana.FloatColumn", function (n) {
        columns.FloatColumn.createNode(RED, this, n);
    });

    RED.nodes.registerType("com.autana.BooleanColumn", function (n) {
        columns.BooleanColumn.createNode(RED, this, n);
    });

    RED.nodes.registerType("com.autana.deleteColumn", function (n) {
        columns.DeleteColumn.createNode(RED, this, n);
    });

    RED.nodes.registerType("com.autana.createIndex", function (n) {
        indexes.CreateIndex.createNode(RED, this, n);
    });

    RED.nodes.registerType("com.autana.deleteIndex", function (n) {
        indexes.DeleteIndex.createNode(RED, this, n);
    });

};
