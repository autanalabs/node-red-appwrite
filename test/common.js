const initNodeId = "init";
const sutNodeId = "sut";
const helperNodeId = "helper-node"
const helperDebugNodeId = "helper-debug-node"
const helperAsserterNodeId = "helper-asserter-node"
const helperMessageSetupNodeId = "helper-message-setup-node"
const appwriteConfigNodeId = "appwrite-config-1"
const should = require("should");
const mainNodes = require("../appwrite.js");

function testNodes(RED) {
    RED.nodes.registerType("helper-init", function (n) {
        createHelperInitNode(RED, this, n);
    });
    return mainNodes(RED);
}

function appWriteConfigNode() {
    return { 
        id: appwriteConfigNodeId,
        type: "appwrite-config",
        endpoint: process.env.TEST_APPWRITE_ENDPOINT,
        project: process.env.TEST_APPWRITE_PROJECT_ID,
        apikey: process.env.TEST_APPWRITE_APIKEY
    };
}

function createHelperInitNode(RED, node, n) {
    console.log('creating HelperInit node...')
    RED.nodes.createNode(node, n);
    node.on("input", function(msg) {
        console.log('helper-init.onMessage()')
        node.send(msg);
    });
}

function helperNode() {
    return { id: helperNodeId, type: "helper" };
}

function helperDebugNode(nextNode) {
    return { 
        id: helperDebugNodeId, 
        type: "helper",
        wires: [nextNode], 
    };
}

function helperAssertNode(nextNode) {
    return { 
        id: helperAsserterNodeId, 
        type: "helper",
        wires: [nextNode], 
    };
}

function helperMessageSetupNode(nextNode) {
    return { 
        id: helperMessageSetupNodeId, 
        type: "helper",
        wires: [nextNode], 
    };
}

function helperInitNode(nextNode) {
    return { 
        id: initNodeId, 
        type: "helper",
        wires: [nextNode], 
    };
}

function helperFunctionNode(nodeId, nextNode) {
    return { 
        id: nodeId, 
        type: "helper",
        wires: [nextNode], 
    };
}

function insertRowNode(nodeId, database, table, nextNode) {
    return {
        id: nodeId,
        type: "com.autana.insertRow",
        appwriteConfig: appwriteConfigNodeId,
        databaseName: database,
        tableName: table,
        docId: null,
        wires: [nextNode],
    };
}

function createTestTableNode(nodeId, database, table, nextNode) {

    return {
        id: nodeId,
        type: "com.autana.createTable",
        appwriteConfig: appwriteConfigNodeId,
        tableName: table,
        databaseName: database,
        skipExists: true,
        wires: [nextNode],
    };
}
function addAgeColumnNode(nodeId, database, table, nextNode) {
    return addIntegerColumnNode(nodeId, database, table, "age", nextNode);
}
function addIntegerColumnNode(nodeId, database, table, name, nextNode) {
    return {
        id: nodeId,
        type: "com.autana.IntegerColumn",
        appwriteConfig: appwriteConfigNodeId,
        databaseName: database,
        tableName: table,
        key: name,
        min: null,
        max: null,
        required: true,
        defaultValue: "",
        isArray: false,
        skipExists: true,
        wires: [nextNode],
    };
}

function addAgeIndexNode(nodeId, database, table, nextNode) {
    return {
        id: nodeId,
        type: "com.autana.createIndex",
        appwriteConfig: appwriteConfigNodeId,
        databaseName: database,
        tableName: table,
        indexName: "ix_age",
        indexType: "key",
        columns: "age",
        orders: "ASC",
        skipExists: true,
        wires: [nextNode],
    };
}

function configureTestSuite(suite, helper) {
    suite.beforeEach(function (done) {
        helper.startServer(done);
    });

    suite.afterEach(function (done) {
        helper.unload().then(function () {
            helper.stopServer(done);
        });
    });
}

function getAndAssertNodesById(helper, nodeId) {
    var node = helper.getNode(nodeId);
    should(node).not.be.null();
    return node;
}

function configureOnCallErrorCallback(done, nodes) {
    nodes.forEach(node => {
        node.on("call:error", (call) => {
            done(new Error(call.firstArg));
        });
    });
}

function getAndAssertMainNodes(done, helper) {
    var initNode = getAndAssertNodesById(helper, initNodeId);
    var helperNode = getAndAssertNodesById(helper, helperNodeId);
    var sutNode = getAndAssertNodesById(helper, sutNodeId);

    if (initNode.type == "helper") {
        initNode.on("input", function (msg) {
            console.log("helperInitNode.onMessage()");
            initNode.send(msg);
        });
    }

    helperNode.on("input", function (msg) {
        try {
            msg.should.have.property("payload");
            done();
        } catch (err) {
            done(err);
        }
    });

    var helperDebugNode = helper.getNode(helperDebugNodeId);
    if (helperDebugNode != null) {
        helperDebugNode.on("input", function (msg) {
            console.log("==DEBUG msg=" + JSON.stringify(msg, null, 2))
            helperDebugNode.send(msg);
        });
    }

    return [initNode, helperNode, sutNode];
}

function performAsserts(helper, assertionCallback) {
    var helperAsserterNode = helper.getNode(helperAsserterNodeId);
    if (helperAsserterNode != null) {
        helperAsserterNode.on("input", function (msg) {
            console.debug("=== ASSERTS ===");
            assertionCallback(msg)
            .then(
                () => helperAsserterNode.send(msg),
                (err) =>  helperAsserterNode.error(err)
            );
        });
    }
 }

 function onMessageSetup(helper, messageSetupFunction) {
    var helperMessageSetupNode = helper.getNode(helperMessageSetupNodeId);
    if (helperMessageSetupNode != null) {
        helperMessageSetupNode.on("input", function (msg) {
            console.debug("=== MESSAGE SETUP ===");
            messageSetupFunction(msg)
            .then(
                (changedMsg) => helperMessageSetupNode.send(changedMsg),
                (err) =>  helperMessageSetupNode.error(err)
            );
        });
    }
 }

module.exports = { helperNode, createTestTableNode, addAgeColumnNode,
    configureTestSuite, helperNodeId, initNodeId, sutNodeId,
    getAndAssertMainNodes, getAndAssertNodesById, 
    configureOnCallErrorCallback, addAgeIndexNode, addIntegerColumnNode,
    helperInitNode, testNodes, helperDebugNode, helperDebugNodeId,
    helperAssertNode, helperAsserterNodeId, performAsserts,
    helperMessageSetupNodeId, helperMessageSetupNode, onMessageSetup,
    insertRowNode, helperFunctionNode,
    appwriteConfigNodeId, appWriteConfigNode
};