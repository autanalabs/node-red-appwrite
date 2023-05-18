
const initNodeId = "init";
const sutNodeId = "sut";
const helperNodeId = "helper-node"
const should = require("should");

function helperNode() {
    return { id: helperNodeId, type: "helper" };
}

function createTestTableNode(nodeId, database, table, nextNode) {

    return {
        id: nodeId,
        type: "create table",
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
        type: "add Integer Column",
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
        type: "create Index",
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

    helperNode.on("input", function (msg) {
        try {
            msg.should.have.property("payload");
            done();
        } catch (err) {
            done(err);
        }
    });

    return [initNode, helperNode, sutNode];
}

module.exports = { helperNode, createTestTableNode, addAgeColumnNode,
    configureTestSuite, helperNodeId, initNodeId, sutNodeId,
    getAndAssertMainNodes, getAndAssertNodesById, 
    configureOnCallErrorCallback, addAgeIndexNode, addIntegerColumnNode
};