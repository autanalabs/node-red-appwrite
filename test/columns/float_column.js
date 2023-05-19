const common = require('../common');
const should = require("should");
const helper = require("node-red-node-test-helper");
const autanaDataTablesNode = require("../../appwrite.js");
const database = "prueba";
const table = 'manolo5';

helper.init(require.resolve("node-red"));

function sut() {
    return {
        id: common.sutNodeId,
        type: "add Float Column",
        appwriteConfig: common.appwriteConfigNodeId,
        tableName: table,
        databaseName: database,
        key: "rate",
        min: null,
        max: null,
        required: true,
        defaultValue: "",
        isArray: false,
        skipExists: true,
        wires: [[common.helperNodeId]],
    };
}

var testFlow = [
    common.appWriteConfigNode(),
    common.createTestTableNode(common.initNodeId, database, table, [common.sutNodeId]),  
    common.helperNode(), 
    sut()
];

describe("testing create-float-column node", function () {

    common.configureTestSuite(this, helper);

    it("add float column test", function (done) {
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

