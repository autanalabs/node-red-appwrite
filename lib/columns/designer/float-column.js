
RED.nodes.registerType('add Float Column',{
    category: 'AutanaCloud',
    color:"#FFFFFF",
    defaults: {
        tableName: {value: ""},
        key: {value: ""},
        min: {value: null},
        max: {value: null},
        required: {value: false},
        defaultValue: {value: ""},
        isArray: {value: false},
        skipExists: {value: false},
        name: {value:""}
    },
    inputs:1,
    outputs:1,
    icon: "appwrite.png",
    align: "left",
    label: function() {
        return this.name ? this.name : this.key ? "integer column " + this.key : "integer column";
    },
    oneditprepare: function() {

    }
});