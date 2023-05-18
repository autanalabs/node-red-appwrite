/**
 * Copyright 2022 AutanaLabs.
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
   
    function AppwriteSdkConfig(n) {
        //console.log('creating AppwriteSdkConfig node...');
        //console.log(JSON.stringify(n));
        RED.nodes.createNode(this, n);
        //console.log(JSON.stringify(this));
        var node = this;
        if (n.endpoint &&
            n.project && 
            n.apikey) {
            var sdk = require('node-appwrite');
            this.client = new sdk.Client();
            this.client
                .setEndpoint(n.endpoint)
                .setProject(n.project)
                .setKey(n.apikey);
            this.SDK = sdk;
            //console.log('AppwriteSdkConfig setup successfully');
        } else {
            node.warn(RED._("appwrite.warn.incomplete-config"));
            console.warn(RED._("appwrite.warn.incomplete-config"));
        }
    }

    RED.nodes.registerType("appwrite-config", AppwriteSdkConfig, {
        endpoint: { type:"text" },
        project: { type:"text" },
        apikey: { type:"text" }
    });

    function AppwriteDatabaseListDocumentsNode(n) {
        //console.log('creating AppwriteDatabaseListDocumentsNode...')
        RED.nodes.createNode(this, n);
        this.appwriteConfig = RED.nodes.getNode(n.appwriteConfig);
        var nodeCollectionId = n.collectionId;
        var node = this;

        if (!this.appwriteConfig) {
            node.warn(RED._("appwrite.warn.missing-config"));
            console.warn(RED._("appwrite.warn.missing-config"));
            return;
        }

        var sdk = this.appwriteConfig.SDK;
        
        if (!sdk) {
            node.warn(RED._("appwrite.warn.wrong-config"));
            console.warn(RED._("appwrite.warn.wrong-config"));
            return;
        }

        var client = this.appwriteConfig.client;

        if (!client) {
            node.warn(RED._("appwrite.warn.missing-client"));
            console.warn(RED._("appwrite.warn.missing-client"));
            return;
        }

        let database = new sdk.Database(client);

        node.on("input", function(msg) {
            //console.log('AppwriteDatabaseListDocumentsNode.onMessage()');

            var collectionId = nodeCollectionId || msg.collectionId;
            if (msg.collectionId && nodeCollectionId && (nodeCollectionId !== msg.collectionId)) {  
                node.warn(RED._("appwrite.error.collection-id-overrided"));
                console.warn(RED._("appwrite.error.collection-id-overrided"));
                return;
            }

            node.status({fill:"blue",shape:"dot",text:"appwrite.status.reading"});
            let promise = database.listDocuments(collectionId);
            promise.then(function (response) {
                msg.payload = response;
                node.status({});
                node.send(msg);
            }, function (err) {
                msg.payload = {};
                msg.error = err;
                node.status({fill:"red",shape:"ring",text:"appwrite.status.error"});
                node.error(RED._("appwrite.error.failed-to-read-documents", {err:err}));
                console.error(RED._("appwrite.error.failed-to-read-documents", {err:err}));
                node.send(msg);
            });
        });
    }

    RED.nodes.registerType("list documents", AppwriteDatabaseListDocumentsNode);

};
