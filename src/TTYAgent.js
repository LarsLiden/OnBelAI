var TTYAgent = /** @class */ (function () {
    function TTYAgent() {
    }
    TTYAgent.prototype.speak = function (lines) {
        var msg = new SpeechSynthesisUtterance();
        lines.forEach(function (line) {
            setTimeout(function () {
                msg.text = line;
                speechSynthesis.speak(msg);
            }, 1000);
        });
    };
    return TTYAgent;
}());
export { TTYAgent };
//# sourceMappingURL=TTYAgent.js.map