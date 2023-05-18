var should = require("should");
var helper = require("node-red-node-test-helper");
var autanaDataTablesNode = require("../autana-data-tables.js");

helper.init(require.resolve("node-red"));

function getHelperNode() {
    return { id: "helper-node", type: "helper" };
}

function getSutNode() {
    return {
        id: "add-float-column",
        type: "add Float Column",
        tableName: '',
        key: "rate",
        min: null,
        max: null,
        required: true,
        defaultValue: "",
        isArray: false,
        skipExists: true,
        wires: [["helper-node"]],
    };
}

var testFlow = [getHelperNode(), getSutNode()];

describe("testing float-column node", function () {

    beforeEach(function (done) {
        helper.startServer(done);
    });

    afterEach(function (done) {
        helper.unload().then(function () {
            helper.stopServer(done);
        });
    });

    it("add columns test", function (done) {
        helper.load(
            autanaDataTablesNode,
            testFlow,
            null,
            function () {
                var helperNode = helper.getNode("helper-node");
                var sutNode = helper.getNode("add-float-column");
                
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

