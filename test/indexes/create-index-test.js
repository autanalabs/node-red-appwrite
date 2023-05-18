var should = require("should");
var helper = require("node-red-node-test-helper");
var autanaDataTablesNode = require("../../appwrite.js");

helper.init(require.resolve("node-red"));

function helperNode() {
    return { id: "helper-node", type: "helper" };
}

function createManolo5TableNode() {
    return {
        id: "create-manolo5-table",
        type: "create table",
        tableName: 'manolo5',
        databaseName: 'prueba',
        skipExists: true,
        wires: [["add-integer-column"]],
    };
}

function addAgeColumnNode() {
    return {
        id: "add-integer-column",
        type: "add Integer Column",
        tableName: 'manolo5',
        databaseName: 'prueba',
        key: "age",
        min: null,
        max: null,
        required: true,
        defaultValue: "",
        isArray: false,
        skipExists: true,
        wires: [["create-index"]],
    };
}

function getSutNode() {
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
    createManolo5TableNode(), 
    addAgeColumnNode(), 
    helperNode() , 
    getSutNode()];

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

