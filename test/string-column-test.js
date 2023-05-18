var should = require("should");
var helper = require("node-red-node-test-helper");
var autanaDataTablesNode = require("../appwrite.js");

helper.init(require.resolve("node-red"));

function getHelperNode() {
    return { id: "helper-node", type: "helper" };
}

function getSutNode() {
    return {
        id: "add-string-column",
        type: "add String Column",
        tableName: '',
        databaseName: '',
        key: "firstName",
        size: 255,
        required: true,
        defaultValue: "",
        isArray: false,
        skipExists: true,
        wires: [["helper-node"]],
    };
}

var testFlow = [getHelperNode(), getSutNode()];

describe("testing string-column nodes", function () {

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
                var sutNode = helper.getNode("add-string-column");
                
                should(sutNode).not.be.null();
                //should(sutNode.n.tableName).not.be.null();

                /*
                sutNode.on("call:status", (call) => {
                    should(call.firstArg.text).be.equal("connected");
                    done();
                });
                */

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
                        },
                        database: {
                            name: 'prueba'
                        }
                    },
                    key : 'pepe'
                });

                sutNode.on("call:error", (call) => {
                    done(new Error(call.firstArg));
                });

            }
        );
    });

    /*
    it("insertOne", function (done) {
        helper.load(
            mongodbNode,
            testFlow,
            { "config-node": testConfig.credentials },
            function () {
                var helperNode = helper.getNode("helper-node");
                var operationNode = helper.getNode("operation-node");

                helperNode.on("input", function (msg) {
                    try {
                        msg.should.have.property("payload");
                        msg.payload.should.have.property("acknowledged", true);
                        done();
                    } catch (err) {
                        done(err);
                    }
                });

                operationNode.receive({
                    payload: [{ uid: uid }],
                    collection: testConfig.collection,
                    operation: "insertOne",
                });

                operationNode.on("call:error", (call) => {
                    done(new Error(call.firstArg));
                });
            }
        );
    });

    it("implicit ObjectId", function (done) {
        helper.load(
            mongodbNode,
            testFlow,
            { "config-node": testConfig.credentials },
            function () {
                var helperNode = helper.getNode("helper-node");
                var operationNode = helper.getNode("operation-node");

                // step 1
                operationNode.receive({
                    payload: [{}],
                    collection: testConfig.collection,
                    operation: "deleteMany",
                });

                helperNode.on("input", function (msg) {
                    if (msg.operation === "deleteMany") {
                        // after delete many
                        operationNode.receive({
                            payload: [
                                {
                                    _id: ObjectId("624b3c625a145193099962d1"),
                                    success: true,
                                },
                            ],
                            collection: testConfig.collection,
                            operation: "insertOne",
                        });
                        return;
                    } else if (msg.operation === "insertOne") {
                        // after insertOne
                        operationNode.receive({
                            payload: [{ _id: "624b3c625a145193099962d1" }],
                            collection: testConfig.collection,
                            operation: "findOne",
                        });
                        return;
                    } else if (msg.operation === "findOne") {
                        msg.should.have.property("payload");
                        msg.payload.should.have.property("success");
                        done();
                    } else {
                        done(new Error("invalid input"));
                    }
                });

                operationNode.on("call:error", (call) => {
                    done(new Error(call.firstArg));
                });
            }
        );
    });

    it("find to array test", function (done) {
        helper.load(
            mongodbNode,
            testFlow,
            { "config-node": testConfig.credentials },
            function () {
                var helperNode = helper.getNode("helper-node");
                var operationNode = helper.getNode("operation-node");

                helperNode.on("input", function (msg) {
                    try {
                        msg.should.have.property("payload");
                        msg.payload.should.be.instanceOf(Array);
                        done();
                    } catch (err) {
                        done(err);
                    }
                });

                operationNode.receive({
                    collection: testConfig.collection,
                    operation: "find",
                    payload: [{}],
                });

                operationNode.on("call:error", (call) => {
                    done(new Error(call.firstArg));
                });
            }
        );
    });

    it("find for each", function (done) {
        helper.load(
            mongodbNode,
            [
                getHelperNode(),
                getConfigNode(),
                { ...getOperationNode(), output: "forEach" },
            ],
            { "config-node": testConfig.credentials },
            function () {
                var helperNode = helper.getNode("helper-node");
                var operationNode = helper.getNode("operation-node");

                let msgCount = 0;

                helperNode.on("input", (msg) => {
                    if (msg.afterInsertMany) {
                        operationNode.receive({
                            operation: "aggregate",
                            payload: [
                                [
                                    { $match: { test: { $in: [1, 2, 3] } } },
                                    { $limit: 3 },
                                ],
                            ],
                        });
                    } else {
                        // count to three
                        msgCount++;
                        if (msgCount === 3) {
                            done();
                        }
                    }
                });

                operationNode.receive({
                    operation: "insertMany",
                    payload: [[{ test: 1 }, { test: 2 }, { test: 3 }]],
                    afterInsertMany: true,
                });

                operationNode.on("call:error", (call) => {
                    done(new Error(call.firstArg));
                });
            }
        );
    });

    it("mongodb error", function (done) {
        helper.load(
            mongodbNode,
            testFlow,
            { "config-node": testConfig.credentials },
            function () {
                var operationNode = helper.getNode("operation-node");

                operationNode.receive({
                    payload: [{ $fail: uid }],
                    collection: testConfig.collection,
                    operation: "findOne",
                });

                operationNode.on("call:error", (call) => {
                    done();
                });
            }
        );
    });

    it("collection operation not supported", function (done) {
        helper.load(
            mongodbNode,
            testFlow,
            { "config-node": testConfig.credentials },
            function () {
                var operationNode = helper.getNode("operation-node");

                operationNode.receive({
                    payload: [{ uid: uid }],
                    collection: testConfig.collection,
                    operation: "willFail",
                });

                operationNode.on("call:error", (call) => {
                    try {
                        should(call.firstArg).have.property(
                            "message",
                            'unknown operation: "willFail"'
                        );
                    }catch(err){
                        done(err);
                    }
                    
                    done();
                });
            }
        );
    });
    */
});

