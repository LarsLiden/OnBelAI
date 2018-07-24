var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
/* eslint-disable */
/* eslint-disable import/first */
var expertRecording = require("./data/Route1Expert.json");
var noviceRecording = require("./data/Route1Novice1.json");
import { RenderSet } from './RenderSet';
var Positioner = /** @class */ (function () {
    function Positioner() {
        /* If less than this threshold, considered to be straight */
        this.BEND_THRESHOLD = 0.1;
        /* If distance is less than this threshold considered to be at some position */
        this.POSITION_THRESHOLD = 3;
    }
    Positioner.prototype.LimbDelta = function (expertLimb, noviceLimb) {
        var deltaX = expertLimb.x - noviceLimb.x;
        var deltaY = expertLimb.y - noviceLimb.y;
        var distance = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
        var matched = this.IsMatched(distance);
        return {
            deltaX: deltaX,
            deltaY: deltaY,
            distance: distance,
            matched: matched,
            occluded: noviceLimb.occluded
        };
    };
    Positioner.prototype.IsLimbBent = function (limb1, limb2, limb3) {
        var angle = Math.abs((limb1.y - limb2.y) * (limb1.x - limb3.x) - (limb1.y - limb3.y) * (limb1.x - limb2.x));
        return angle < this.BEND_THRESHOLD;
    };
    Positioner.prototype.IsMatched = function (distance) {
        return distance < this.POSITION_THRESHOLD;
    };
    /* Return list of Deltas for each frame in expert recording */
    Positioner.prototype.GetDeltas = function (expert, novice) {
        var _this = this;
        return expert.frames.map(function (e) { return _this.GetDelta(e, novice); });
    };
    Positioner.prototype.GetBestExpertFrame = function (deltas, novice) {
        // Get largest match
        var mostMatches = 0;
        deltas.map(function (d) { mostMatches = Math.max(mostMatches, d.matchCount); });
        // Filter to ones with max matches
        var candidateDeltas = deltas.filter(function (d) { return d.matchCount === mostMatches; });
        // Of the remaining find one with smallest delta
        var smallestDistance = Number.MAX_SAFE_INTEGER;
        var bestDelta = candidateDeltas[0];
        candidateDeltas.map(function (d) {
            var totalDistance = d.leftHand.distance +
                d.rightHand.distance +
                d.leftFoot.distance +
                d.rightFoot.distance +
                d.leftHip.distance +
                d.rightHip.distance;
            if (totalDistance < smallestDistance) {
                smallestDistance = totalDistance;
                bestDelta = d;
            }
        });
        return bestDelta;
    };
    /* Return next frame containing a hold change */
    Positioner.prototype.GetNextHoldChangeFrame = function (startDelta, deltas, expert) {
    };
    Positioner.prototype.GetDelta = function (expert, novice) {
        var leftHandDelta = this.LimbDelta(expert.leftHand, novice.leftHand);
        var rightHandDelta = this.LimbDelta(expert.rightHand, novice.rightHand);
        var leftFootDelta = this.LimbDelta(expert.leftFoot, novice.leftFoot);
        var rightFootDelta = this.LimbDelta(expert.rightFoot, novice.rightFoot);
        var matchCount = (leftHandDelta.matched ? 1 : 0) + (rightHandDelta.matched ? 1 : 0) + (leftFootDelta.matched ? 1 : 0) + (rightFootDelta.matched ? 1 : 0);
        return {
            leftHand: leftHandDelta,
            rightHand: rightHandDelta,
            leftFoot: leftFootDelta,
            rightFoot: rightFootDelta,
            leftHip: this.LimbDelta(expert.leftHip, novice.leftHip),
            rightHip: this.LimbDelta(expert.rightHip, novice.rightHip),
            leftArmBent: this.IsLimbBent(novice.leftHand, novice.leftElbow, novice.leftShoulder),
            rightArmBent: this.IsLimbBent(novice.rightHand, novice.rightElbow, novice.rightShoulder),
            leftLegBent: this.IsLimbBent(novice.leftFoot, novice.leftKnee, novice.leftHip),
            rightLegBent: this.IsLimbBent(novice.rightFoot, novice.rightShoulder, novice.rightHip),
            matchCount: matchCount
        };
    };
    Positioner.prototype.Run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var firstPos, deltas, bestDelta, nextDelta;
            return __generator(this, function (_a) {
                firstPos = noviceRecording.frames[0];
                deltas = this.GetDeltas(expertRecording, firstPos);
                bestDelta = this.GetBestExpertFrame(deltas, firstPos);
                nextDelta = this.GetNextHoldChangeFrame(bestDelta, deltas, expertRecording);
                RenderSet.AddBodyPosition(expertRecording.frames[0]);
                return [2 /*return*/];
            });
        });
    };
    return Positioner;
}());
export { Positioner };
//# sourceMappingURL=positioner.js.map