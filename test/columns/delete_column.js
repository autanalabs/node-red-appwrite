const common = require('../common');
const should = require("should");
const helper = require("node-red-node-test-helper");
const autanaDataTablesNode = require("../../appwrite.js");
const database = "prueba";
const table = 'manolo5';
const column = 'age2';
const addColumnNodeId = "add-age2-column";

helper.init(require.resolve("node-red"));

function sut() {
    return {
        id: common.sutNodeId,
        type: "com.autana.deleteColumn",
        appwriteConfig: common.appwriteConfigNodeId,
        tableName: table,
        databaseName: database,
        key: column,
        skipNotFound: true,
        wires: [[common.helperNodeId]],
    };
}

var testFlow = [
    common.appWriteConfigNode(),
    common.createTestTableNode(common.initNodeId, database, table, [addColumnNodeId]), 
    common.addIntegerColumnNode(addColumnNodeId, database, table, column, [common.sutNodeId]), 
    common.helperNode(), 
    sut()
];

describe("testing delete-column node", function () {

    common.configureTestSuite(this, helper);

    it("delete existent column test", function (done) {
        this.timeout(5000);
        helper.load(
            autanaDataTablesNode,
            testFlow,
            null,
            function () {
                var [initNode, helperNode, sutNode] = common.getAndAssertMainNodes(done, helper);
                var addColumnNode = common.getAndAssertNodesById(helper, addColumnNodeId);


                common.configureOnCallErrorCallback(done, [
                    initNode, helperNode, sutNode, addColumnNode
                ]);
                
                initNode.receive({});
            }
        );
    });
});

