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
        appwriteConfig: common.appwriteConfigNodeId,
        databaseName: database,
        tableName: null,
        wires: [[common.helperDebugNodeId]],
    };
}

var testFlow = [
    common.appWriteConfigNode(),
    common.createTestTableNode(common.initNodeId, database, table, [anotherTableNodeId]),
    common.createTestTableNode(anotherTableNodeId, database, anotherTable, [common.sutNodeId]), 
    common.helperNode(), 
    common.helperDebugNode([common.helperAsserterNodeId]),
    sut(),
    common.helperAssertNode([common.helperNodeId]
    )
];

describe("testing list-tables node", function () {

    common.configureTestSuite(this, helper);

    it("list tables test", function (done) {
        this.timeout(5000);
        helper.load(
            autanaDataTablesNode,
            testFlow,
            null,
            function () {
                var [initNode, helperNode, sutNode] = common.getAndAssertMainNodes(done, helper);
                var anotherTableNode = common.getAndAssertNodesById(helper, anotherTableNodeId);
                var helperAsserterNode = common.getAndAssertNodesById(helper, common.helperAsserterNodeId);
                
                common.configureOnCallErrorCallback(done, [
                    initNode, helperNode, sutNode, anotherTableNode, helperAsserterNode
                ]);

                common.performAsserts(helper, async function(msg) {
                    should(msg).not.be.null();
                    should(msg.payload).not.be.null();
                    should(msg.payload.total).greaterThanOrEqual(2);
                    should(msg.payload.tables).not.be.null();

                    firstTable = msg.payload.tables.filter(t => t.name == table);
                    should(firstTable).not.be.empty();
                    
                    secondTable = msg.payload.tables.filter(t => t.name == anotherTable);
                    should(secondTable).not.be.empty();
                });
                
                initNode.receive({});
            }
        );
    });
});

