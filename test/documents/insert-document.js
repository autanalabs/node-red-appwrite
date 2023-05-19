const common = require('../common');
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
        type: "insert row",
        databaseName: database,
        tableName: table,
        docId: null,
        wires: [[common.helperNodeId]],
    };
}

var testFlow = [
    common.createTestTableNode(common.initNodeId, database, table, [addAgeColumnNodeId]), 
    common.addAgeColumnNode(addAgeColumnNodeId, database, table, [common.helperMessageSetupNodeId]), 
    common.helperMessageSetupNode([common.sutNodeId]),
    common.helperNode(), 
    sut()
];

describe("testing insert document node", function () {

    common.configureTestSuite(this, helper);

    it("insert document test", function (done) {
        this.timeout(0);
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

                common.onMessageSetup(helper, async function(msg) {
                    msg.payload = {
                        age: 10
                    };
                    return msg;
                });
                
                initNode.receive({});
            }
        );
    });
});

