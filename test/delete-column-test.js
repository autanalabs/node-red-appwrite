var should = require("should");
var helper = require("node-red-node-test-helper");
var autanaDataTablesNode = require("../autana-data-tables.js");

helper.init(require.resolve("node-red"));

function getHelperNode() {
    return { id: "helper-node", type: "helper" };
}

function getSutNode() {
    return {
        id: "delete-column",
        type: "delete Column",
        tableName: '',
        key: "isVip2",
        skipNotFound: true,
        wires: [["helper-node"]],
    };
}

var testFlow = [getHelperNode(), getSutNode()];

describe("testing delete-column node", function () {

    beforeEach(function (done) {
        helper.startServer(done);
    });

    afterEach(function (done) {
        helper.unload().then(function () {
            helper.stopServer(done);
        });
    });

    it("delete column test", function (done) {
        helper.load(
            autanaDataTablesNode,
            testFlow,
            null,
            function () {
                var helperNode = helper.getNode("helper-node");
                var sutNode = helper.getNode("delete-column");
                
                should(sutNode).not.be.null();

                helperNode.on("input", function (msg) {
                    try {
                        msg.should.have.property("payload");
                        //msg.payload.should.have.property("key");
                        done();
                    } catch (err) {
                        done(err);
                    }
                });

                sutNode.receive({
                    _autana: {
                        table: {
                            name: 'manolo5'
                        }
                    }
                });

                sutNode.on("call:error", (call) => {
                    done(new Error(call.firstArg));
                });

            }
        );
    });
});

