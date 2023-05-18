const common = require('./common');
const should = require("should");
const helper = require("node-red-node-test-helper");
const autanaDataTablesNode = require("../../appwrite.js");
const database = "prueba";
const table = 'manolo5';
const addAgeColumnNodeId = "add-age-column";

helper.init(require.resolve("node-red"));

function sut() {
    return {
        id: common.sutNodeId,
        type: "create Index",
        databaseName: database,
        tableName: table,
        indexName: "ix_age",
        indexType: "key",
        columns: "age",
        orders: "ASC",
        skipExists: true,
        wires: [[common.helperNodeId]],
    };
}

var testFlow = [
    common.createTestTableNode(common.initNodeId, database, table, [addAgeColumnNodeId]), 
    common.addAgeColumnNode(addAgeColumnNodeId, database, table, [common.sutNodeId]), 
    common.helperNode(), 
    sut()
];

describe("testing create-index node", function () {

    common.configureTestSuite(this, helper);

    it("add index test", function (done) {
        this.timeout(5000);
        helper.load(
            autanaDataTablesNode,
            testFlow,
            null,
            function () {
                var [initNode, helperNode, sutNode] = common.getAndAssertMainNodes(done, helper);
                var addAgeColumnNode = common.getAndAssertNodesById(helper, addAgeColumnNodeId);

                common.configureOnCallErrorCallback(done, [
                    initNode, helperNode, sutNode, addAgeColumnNode
                ]);
                
                initNode.receive({});
            }
        );
    });
});

