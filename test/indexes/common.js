
const initNodeId = "init";
const sutNodeId = "sut";
const helperNodeId = "helper-node"

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

module.exports = { helperNode, createTestTableNode, addAgeColumnNode,
    configureTestSuite, helperNodeId, initNodeId, sutNodeId
};