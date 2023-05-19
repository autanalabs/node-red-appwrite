const uuid = require('uuid');
const common = require('../common');
const should = require("should");
const helper = require("node-red-node-test-helper");
const autanaDataTablesNode = require("../../appwrite.js");
const database = "prueba";
const table = 'manolo3b';
const docId = uuid.v4();
const oldAge = 10;
const addAgeColumnNodeId = "add-age-column";
const insertRowNodeId = "insert-row-node";
const helperFunctionNodeId = "helper-function-node";

helper.init(require.resolve("node-red"));

function sut() {
    return {
        id: common.sutNodeId,
        type: "com.autana.deleteRow",
        appwriteConfig: common.appwriteConfigNodeId,
        databaseName: database,
        tableName: table,
        docId: null,
        wires: [[common.helperDebugNodeId]],
    };
}

var testFlow = [
    common.appWriteConfigNode(),
    common.createTestTableNode(common.initNodeId, database, table, [addAgeColumnNodeId]), 
    common.addAgeColumnNode(addAgeColumnNodeId, database, table, [common.helperMessageSetupNodeId]), 
    common.helperMessageSetupNode([insertRowNodeId]),
    common.insertRowNode(insertRowNodeId, database, table, [helperFunctionNodeId]),
    common.helperFunctionNode(helperFunctionNodeId, [common.sutNodeId]), 
    common.helperDebugNode([common.helperNodeId]),
    common.helperNode(), 
    sut()
];

describe("testing delete document node", function () {

    common.configureTestSuite(this, helper);

    it("delete document test", function (done) {
        this.timeout(5000);
        helper.load(
            autanaDataTablesNode,
            testFlow,
            null,
            function () {
                var [initNode, helperNode, sutNode] = common.getAndAssertMainNodes(done, helper);
                var addAgeColumnNode = common.getAndAssertNodesById(helper, addAgeColumnNodeId);
                var insertRowNode = common.getAndAssertNodesById(helper, insertRowNodeId);
                var helperFunctionNode = common.getAndAssertNodesById(helper, helperFunctionNodeId);
            
                common.configureOnCallErrorCallback(done, [
                    initNode, helperNode, sutNode, addAgeColumnNode, 
                    insertRowNode, helperFunctionNode
                ]);

                common.onMessageSetup(helper, async function(msg) {
                    msg.docId = docId;
                    msg.payload = {
                        age: oldAge
                    };
                    return msg;
                });

                helperFunctionNode.on("input", function (msg) {
                    console.debug("=== SET PAYLOAD TO DELETE ===");
                    msg.docId = docId;
                    helperFunctionNode.send(msg);
                });
                
                initNode.receive({});
            }
        );
    });
});

