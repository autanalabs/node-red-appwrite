
function helperNode() {
    return { id: "helper-node", type: "helper" };
}

function createTestTableNode() {
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

function configureTestSuite(suite, helper) {
    suite.beforeEach(function (done) {
        helper.startServer(done);
    });

    suite.afterEach(function (done) {
        helper.unload().then(function () {
            helper.stopServer(done);
        });
    });
}

module.exports = { helperNode, createTestTableNode, addAgeColumnNode,
    configureTestSuite
};