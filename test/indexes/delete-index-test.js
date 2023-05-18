const common = require('./common');
const should = require("should");
const helper = require("node-red-node-test-helper");
const autanaDataTablesNode = require("../../appwrite.js");
const database = "prueba";
const table = 'manolo5';
const addAgeColumnNodeId = "add-age-column";
const addAgeIndexNodeId = "add-age-index"

helper.init(require.resolve("node-red"));

function sut() {
    return {
        id: common.sutNodeId,
        type: "delete Index",
        databaseName: database,
        tableName: table,
        indexName: "ix_age",
        skipExists: true,
        wires: [[common.helperNodeId]],
    };
}

var testFlow = [
    common.createTestTableNode(common.initNodeId, database, table, [addAgeColumnNodeId]), 
    common.addAgeColumnNode(addAgeColumnNodeId, database, table, [addAgeIndexNodeId]), 
    common.addAgeIndexNode(addAgeIndexNodeId, database, table, [common.sutNodeId]),
    common.helperNode(), 
    sut()
];

describe("testing delete-index node", function () {

    common.configureTestSuite(this, helper);

    it("delete existent index test", function (done) {
        this.timeout(5000);
        helper.load(
            autanaDataTablesNode,
            testFlow,
            null,
            function () {
                var [initNode, helperNode, sutNode] = common.getAndAssertMainNodes(done, helper);
                var addAgeColumnNode = common.getAndAssertNodesById(helper, addAgeColumnNodeId);
                var addAgeIndexNode = common.getAndAssertNodesById(helper, addAgeIndexNodeId);


                common.configureOnCallErrorCallback(done, [
                    initNode, helperNode, sutNode, addAgeColumnNode,
                    addAgeIndexNode
                ]);
                
                initNode.receive({});
            }
        );
    });
});

