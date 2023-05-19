const common = require('../common');
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
        type: "delete table",
        appwriteConfig: common.appwriteConfigNodeId,
        databaseName: database,
        tableName: table,
        skipNotFound: true,
        wires: [[common.helperNodeId]],
    };
}

var testFlow = [
    common.appWriteConfigNode(),
    common.createTestTableNode(common.initNodeId, database, table, [common.sutNodeId]), 
    common.helperNode(), 
    sut()
];

describe("testing delete-table node", function () {

    common.configureTestSuite(this, helper);

    it("delete existent table test", function (done) {
        this.timeout(5000);
        helper.load(
            autanaDataTablesNode,
            testFlow,
            null,
            function () {
                var [initNode, helperNode, sutNode] = common.getAndAssertMainNodes(done, helper);
                
                common.configureOnCallErrorCallback(done, [
                    initNode, helperNode, sutNode
                ]);
                
                initNode.receive({});
            }
        );
    });
});

