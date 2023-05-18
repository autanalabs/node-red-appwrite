
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
    return {
        id: nodeId,
        type: "add Integer Column",
        databaseName: database,
        tableName: table,
        key: "age",
        min: null,
        max: null,
        required: true,
        defaultValue: "",
        isArray: false,
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

function configureOnCallError(done, node) {
    node.on("call:error", (call) => {
        done(new Error(call.firstArg));
    });
}

function getAndAssertNodes(done, helper) {
    var initNode = helper.getNode(initNodeId);
    var helperNode = helper.getNode(helperNodeId);
    var sutNode = helper.getNode(sutNodeId);

    should(initNode).not.be.null();
    should(helperNode).not.be.null();
    should(sutNode).not.be.null();
  
    initNode.on("call:error", (call) => {
        done(new Error(call.firstArg));
    });

    helperNode.on("input", function (msg) {
        try {
            msg.should.have.property("payload");
            done();
        } catch (err) {
            done(err);
        }
    });

    sutNode.on("call:error", (call) => {
        done(new Error(call.firstArg));
    });

    return [initNode, helperNode, sutNode];
}

module.exports = { helperNode, createTestTableNode, addAgeColumnNode,
    configureTestSuite, helperNodeId, initNodeId, sutNodeId,
    getAndAssertNodes, getAndAssertNodesById, configureOnCallError
};