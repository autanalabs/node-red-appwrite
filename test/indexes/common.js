
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

module.exports = { helperNode, createTestTableNode, addAgeColumnNode
};