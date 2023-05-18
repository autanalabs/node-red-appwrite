const common = require('../common');
const should = require("should");
const helper = require("node-red-node-test-helper");
const autanaDataTablesNode = require("../../appwrite.js");
const database = "prueba";
const table = 'manolo5';
const anotherTable = 'manolo6';
const anotherTableNodeId = 'add-another-table';
const addAgeColumnNodeId = "add-age-column";
const addAgeIndexNodeId = "add-age-index"

helper.init(require.resolve("node-red"));

function sut() {
    return {
        id: common.sutNodeId,
        type: "list tables",
        databaseName: database,
        tableName: null,
        wires: [[common.helperDebugNodeId]],
    };
}

var testFlow = [
    common.createTestTableNode(common.initNodeId, database, table, [anotherTableNodeId]),
    common.createTestTableNode(anotherTableNodeId, database, anotherTable, [common.sutNodeId]), 
    common.helperNode(), 
    common.helperDebugNode([common.helperNodeId]),
    sut()
];

describe("testing list-tables node", function () {

    common.configureTestSuite(this, helper);

    it("list tables test", function (done) {
        this.timeout(0);
        helper.load(
            autanaDataTablesNode,
            testFlow,
            null,
            function () {
                var [initNode, helperNode, sutNode] = common.getAndAssertMainNodes(done, helper);
                var anotherTableNode = common.getAndAssertNodesById(helper, anotherTableNodeId);
                common.configureOnCallErrorCallback(done, [
                    initNode, helperNode, sutNode, anotherTableNode
                ]);
                
                initNode.receive({});
            }
        );
    });
});

