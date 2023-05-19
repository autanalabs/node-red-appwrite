const uuid = require('uuid');
const common = require('../common');
const should = require("should");
const helper = require("node-red-node-test-helper");
const autanaDataTablesNode = require("../../appwrite.js");
const database = "prueba";
const table = 'manolo3c';
const docId1 = uuid.v4();
const docId2 = uuid.v4();
const age1 = 10;
const age2 = 20;
const addAgeColumnNodeId = "add-age-column";
const insertRowNodeId1 = "insert-row-node-1";
const insertRowNodeId2 = "insert-row-node-2";
const helperFunctionNodeId1 = "helper-function-node-1";
const helperFunctionNodeId2 = "helper-function-node-2";

helper.init(require.resolve("node-red"));

function sut() {
    return {
        id: common.sutNodeId,
        type: "read table",
        databaseName: database,
        tableName: table,
        query: null,
        wires: [[common.helperDebugNodeId]],
    };
}

var testFlow = [
    common.createTestTableNode(common.initNodeId, database, table, [addAgeColumnNodeId]), 
    common.addAgeColumnNode(addAgeColumnNodeId, database, table, [helperFunctionNodeId1]), 
    common.helperFunctionNode(helperFunctionNodeId1, [insertRowNodeId1]), 
    common.insertRowNode(insertRowNodeId1, database, table, [helperFunctionNodeId2]),
    common.helperFunctionNode(helperFunctionNodeId2, [insertRowNodeId2]), 
    common.insertRowNode(insertRowNodeId2, database, table, [common.sutNodeId]),
    common.helperDebugNode([common.helperAsserterNodeId]),
    common.helperAssertNode([common.helperNodeId]),
    common.helperNode(), 
    sut()
];

describe("testing update document node", function () {

    common.configureTestSuite(this, helper);

    it("update document test", function (done) {
        this.timeout(5000);
        helper.load(
            autanaDataTablesNode,
            testFlow,
            null,
            function () {
                var [initNode, helperNode, sutNode] = common.getAndAssertMainNodes(done, helper);
                var addAgeColumnNode = common.getAndAssertNodesById(helper, addAgeColumnNodeId);
                var insertRowNode1 = common.getAndAssertNodesById(helper, insertRowNodeId1);
                var insertRowNode2 = common.getAndAssertNodesById(helper, insertRowNodeId2);
                var helperFunctionNode1 = common.getAndAssertNodesById(helper, helperFunctionNodeId1);
                var helperFunctionNode2 = common.getAndAssertNodesById(helper, helperFunctionNodeId2);
                var helperAsserterNode = common.getAndAssertNodesById(helper, common.helperAsserterNodeId);
                

                common.configureOnCallErrorCallback(done, [
                    initNode, helperNode, sutNode, addAgeColumnNode, 
                    insertRowNode1, insertRowNode2,
                    helperFunctionNode1, helperFunctionNode2,
                    helperAsserterNode
                ]);

                common.onMessageSetup(helper, async function(msg) {
                    msg.docId = docId;
                    msg.payload = {
                        age: oldAge
                    };
                    return msg;
                });

                helperFunctionNode1.on("input", function (msg) {
                    console.debug("=== SET PAYLOAD TO 1st Insert ===");
                    msg.docId = docId1;
                    msg.payload = {
                        age: age1
                    };
                    helperFunctionNode1.send(msg);
                });

                helperFunctionNode2.on("input", function (msg) {
                    console.debug("=== SET PAYLOAD TO 2nd Insert ===");
                    msg.docId = docId2;
                    msg.payload = {
                        age: age2
                    };
                    helperFunctionNode2.send(msg);
                });

                common.performAsserts(helper, async function(msg) {
                    should(msg).not.be.null();
                    should(msg.payload).not.be.null();
                    should(msg.payload.total).be.greaterThanOrEqual(2);
                    should(msg.payload.documents).not.be.empty();
                    
                    firstDoc = msg.payload.documents.filter(d => d.$id == docId1);
                    should(firstDoc).not.be.empty();
                    should(firstDoc[0].$id).be.equals(docId1);
                    should(firstDoc[0].age).be.equals(age1);
                    
                    secondDoc = msg.payload.documents.filter(d => d.$id == docId2);
                    should(secondDoc).not.be.empty();
                    should(secondDoc[0].$id).be.equals(docId2);
                    should(secondDoc[0].age).be.equals(age2);
                   
                });
                
                initNode.receive({});
            }
        );
    });
});

