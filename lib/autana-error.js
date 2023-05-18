
class AutanaError extends Error {

    constructor(msg) {
        super(msg)
    }
}

function handleError (message, node, err, ) {
    console.error(message);
    console.error(err);
    node.status({fill:"red",shape:"ring",text:"autanaCloud.status.error"});
    node.error(err);
}

module.exports = { AutanaError, handleError };