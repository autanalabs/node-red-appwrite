const common = require('../common');
const should = require("should");
const helper = require("node-red-node-test-helper");
const autanaDataTablesNode = require("../../appwrite.js");
const database = "prueba";
const table = 'manolo4';
const newAge = 10;
const addAgeColumnNodeId = "add-age-column";

helper.init(require.resolve("node-red"));

function sut() {
    return {
        id: common.sutNodeId,
        type: "insert row",
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
    common.helperMessageSetupNode([common.sutNodeId]),
    common.helperDebugNode([common.helperAsserterNodeId]),
    common.helperAssertNode([common.helperNodeId]),
    common.helperNode(), 
    sut()
];

describe("testing insert document node", function () {

    common.configureTestSuite(this, helper);

    it("insert document test", function (done) {
        this.timeout(5000);
        helper.load(
            autanaDataTablesNode,
            testFlow,
            null,
            function () {
                var [initNode, helperNode, sutNode] = common.getAndAssertMainNodes(done, helper);
                var addAgeColumnNode = common.getAndAssertNodesById(helper, addAgeColumnNodeId);
                var helperAsserterNode = common.getAndAssertNodesById(helper, common.helperAsserterNodeId);
                

                common.configureOnCallErrorCallback(done, [
                    initNode, helperNode, sutNode, addAgeColumnNode,
                    helperAsserterNode
                ]);

                common.onMessageSetup(helper, async function(msg) {
                    msg.payload = {
                        age: newAge
                    };
                    return msg;
                });

                common.performAsserts(helper, async function(msg) {
                    should(msg).not.be.null();
                    should(msg.payload).not.be.null();
                    should(msg.payload.$id).not.be.null()
                    should(msg.payload.age).equal(newAge);
                   
                });
                
                initNode.receive({});
            }
        );
    });
});

