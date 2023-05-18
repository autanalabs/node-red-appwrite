const common = require('./common');
var should = require("should");
var helper = require("node-red-node-test-helper");
var autanaDataTablesNode = require("../../appwrite.js");

helper.init(require.resolve("node-red"));

function sut() {
    return {
        id: "create-index",
        type: "create Index",
        tableName: 'manolo5',
        databaseName: 'prueba',
        indexName: "ix_age",
        indexType: "key",
        columns: "age",
        orders: "ASC",
        skipExists: true,
        wires: [["helper-node"]],
    };
}

var testFlow = [
    common.createTestTableNode(), 
    common.addAgeColumnNode(), 
    common.helperNode() , 
    sut()];

describe("testing create-index node", function () {

    beforeEach(function (done) {
        helper.startServer(done);
    });

    afterEach(function (done) {
        helper.unload().then(function () {
            helper.stopServer(done);
        });
    });

    it("add index test", function (done) {
        this.timeout(5000);
        helper.load(
            autanaDataTablesNode,
            testFlow,
            null,
            function () {
                var initNode = helper.getNode("create-manolo5-table");
                var helperNode = helper.getNode("helper-node");
                var sutNode = helper.getNode("create-index");
            
                should(sutNode).not.be.null();
                should(helperNode).not.be.null();
                should(initNode).not.be.null();
                
                helperNode.on("input", function (msg) {
                    try {
                        msg.should.have.property("payload");
                        done();
                    } catch (err) {
                        done(err);
                    }
                });

                initNode.on("call:error", (call) => {
                    done(new Error(call.firstArg));
                });

                sutNode.on("call:error", (call) => {
                    done(new Error(call.firstArg));
                });

                initNode.receive({
                    _autana: {
                        table: {
                            name: 'manolo5'
                        },
                        database: {
                            name: 'prueba'
                        }
                    }
                });
            }
        );
    });
});

