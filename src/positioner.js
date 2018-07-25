/* eslint-disable */
/* eslint-disable import/first */
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
import { RenderSet } from './RenderSet';
var expertRecordingRaw = require("./data/joints_route2_climb2.json");
var noviceRecordingRaw = require("./data/joints_route2_climb4.json");
var route = require("./data/route2.json");
// Little hack to adapt the json format
var expertRecording = { frames: Array() };
for (var f in expertRecordingRaw) {
    //console.log(f)
    var b = expertRecordingRaw[f][0];
    expertRecording.frames.push(b);
}
// Little hack to adapt the json format
var noviceRecording = { frames: Array() };
for (var f in noviceRecordingRaw) {
    //console.log(f)
    var b = noviceRecordingRaw[f][0];
    noviceRecording.frames.push(b);
}
/*
console.log(expertRecording)
console.log(noviceRecording)
console.log(route)
*/
var Positioner = /** @class */ (function () {
    function Positioner() {
        /* If less than this threshold, considered to be straight */
        this.BEND_THRESHOLD = 0.1;
        /* If distance is less than this threshold considered to be at some position */
        this.POSITION_THRESHOLD = 3;
        this.curFrame = 0;
        /* If limb is within LIMB_HOLD_THRESHOLD of hold position * radius multiplier
        for LIMB_HOLD_MIN_FRAMES, limb is considered to be on that hold */
        this.HOLD_RADIUS_MULTIPLIER = 2;
        this.LIMB_HOLD_THRESHOLD = 5;
        this.LIMB_HOLD_MAX_FRAME_MOVEMENT = 20;
    }
    Positioner.prototype.LimbDistance = function (Limb1, Limb2) {
        var deltaX = Limb1.x - Limb2.x;
        var deltaY = Limb1.y - Limb2.y;
        var distance = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
        return distance;
    };
    Positioner.prototype.LimbDelta = function (expertLimb, noviceLimb) {
        var distance = this.LimbDistance(expertLimb, noviceLimb);
        var matched = this.IsMatched(distance);
        return {
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
        console.log('Best delta index - ' + deltas.findIndex(function (d) { return d === bestDelta; }));
        return bestDelta;
    };
    /* Return next frame containing a hold change */
    Positioner.prototype.GetNextHoldChangeFrame = function (startDelta, deltas, expert) {
        var bestDeltaIndex = deltas.findIndex(function (d) { return startDelta === d; });
        if (bestDeltaIndex === -1) {
            return;
        }
        var nextBestIndex = -1;
        for (var i = bestDeltaIndex + 1; i++; i < expert.frames.length) {
            var d = this.GetDelta(expert.frames[bestDeltaIndex], expert.frames[i]);
            if (!this.IsMatched(d.leftHand.distance) || !this.IsMatched(d.rightHand.distance) ||
                !this.IsMatched(d.leftFoot.distance) || !this.IsMatched(d.rightFoot.distance)) {
                nextBestIndex = i;
                break;
            }
        }
        if (nextBestIndex !== -1) {
            console.log('The next best frame index is - ' + nextBestIndex);
            return deltas[nextBestIndex];
        }
        return undefined;
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
            matchCount: matchCount,
            expertFrame: expert,
            noviceFrame: novice
        };
    };
    Positioner.prototype.LimbOnHold = function (limb, routeMap) {
        //console.log(`Checkling limb position against ${routeMap.holds.length} holds in route`)
        for (var _i = 0, _a = routeMap.holds; _i < _a.length; _i++) {
            var hold = _a[_i];
            var deltaX = limb.x - hold.x;
            var deltaY = limb.y - hold.y;
            var distance = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
            if (distance <= hold.radius + this.LIMB_HOLD_THRESHOLD) {
                // Now check if the limb has moved too much
                /* Actually this doesn't work because we call LimbOnHold before building history
                if (limb.history.distanceMoved[1] > this.LIMB_HOLD_MAX_FRAME_MOVEMENT) {
                    return false;
                }
                */
                return true;
            }
        }
        return false;
    };
    Positioner.prototype.AnnotateRecording = function (inputRecording, routeMap) {
        var maxHistory = 30;
        var positionHistory = [];
        // For each frame, we'll look back in history and figure out how far it's moved in the past maxHistory frames
        var f = 0;
        for (var _i = 0, _a = inputRecording.frames; _i < _a.length; _i++) {
            var frame = _a[_i];
            // First we'll check which (if any) limbs are on holds in this frame.
            // No need to check hips and shoulders and stuff.
            //console.log(`Annotating frame ${frame.frameNumber} of ${inputRecording.frames.length}`)
            console.log("Annotating frame " + f + " of " + inputRecording.frames.length);
            frame.leftHand.onHold = this.LimbOnHold(frame.leftHand, routeMap);
            frame.rightHand.onHold = this.LimbOnHold(frame.rightHand, routeMap);
            frame.leftFoot.onHold = this.LimbOnHold(frame.leftFoot, routeMap);
            frame.rightFoot.onHold = this.LimbOnHold(frame.rightFoot, routeMap);
            var numLimbsOnHolds = (frame.leftHand.onHold ? 1 : 0) + (frame.rightHand.onHold ? 1 : 0)
                + (frame.leftFoot.onHold ? 1 : 0) + (frame.rightFoot.onHold ? 1 : 0);
            if (numLimbsOnHolds > 0) {
                console.log("Frame " + f + " | " + numLimbsOnHolds + " limbs on holds: LH " + frame.leftHand.onHold + ", RH: " + frame.rightHand.onHold + ", LF " + frame.leftFoot.onHold + ", RF: " + frame.rightFoot.onHold);
            }
            // We'll store the distance each limb moved for each frame count between 0 and maxHistory
            // so later on we can say leftHand.history.distanceMoved[1] or leftHand.history.distanceMoved[10]
            // for 1 or 10 frames
            //
            // Start by adding this frame so deltas with index 0 are also this frame
            positionHistory.unshift(frame);
            // If we've got more history than we can use, remove the oldest one
            if (positionHistory.length > maxHistory) {
                positionHistory.pop();
            }
            // Make sure our arrays actually exist because they don't when the file is first loaded
            // This is probably a terrible pattern 
            var zeroHistory = { distanceMoved: [0] };
            frame.leftHand.history = zeroHistory;
            frame.leftHand.history = zeroHistory;
            frame.leftElbow.history = zeroHistory;
            frame.leftShoulder.history = zeroHistory;
            frame.rightHand.history = zeroHistory;
            frame.rightElbow.history = zeroHistory;
            frame.rightShoulder.history = zeroHistory;
            frame.leftFoot.history = zeroHistory;
            frame.leftKnee.history = zeroHistory;
            frame.rightFoot.history = zeroHistory;
            frame.rightKnee.history = zeroHistory;
            frame.leftHip.history = zeroHistory;
            frame.rightHip.history = zeroHistory;
            for (var i = 0; i < maxHistory; i++) {
                // Determine what frame we'll use to compare
                var deltaFrame;
                if (positionHistory.length > i) {
                    deltaFrame = positionHistory[i];
                }
                else {
                    // We don't have the full buffer yet, so use the oldest
                    deltaFrame = positionHistory[positionHistory.length - 1];
                }
                frame.leftHand.history.distanceMoved.unshift(this.LimbDistance(frame.leftHand, deltaFrame.leftHand));
                frame.leftElbow.history.distanceMoved.unshift(this.LimbDistance(frame.leftElbow, deltaFrame.leftElbow));
                frame.leftShoulder.history.distanceMoved.unshift(this.LimbDistance(frame.leftShoulder, deltaFrame.leftShoulder));
                frame.rightHand.history.distanceMoved.unshift(this.LimbDistance(frame.rightHand, deltaFrame.rightHand));
                frame.rightElbow.history.distanceMoved.unshift(this.LimbDistance(frame.rightElbow, deltaFrame.rightElbow));
                frame.rightShoulder.history.distanceMoved.unshift(this.LimbDistance(frame.rightShoulder, deltaFrame.rightShoulder));
                frame.leftFoot.history.distanceMoved.unshift(this.LimbDistance(frame.leftFoot, deltaFrame.leftFoot));
                frame.leftKnee.history.distanceMoved.unshift(this.LimbDistance(frame.leftKnee, deltaFrame.leftKnee));
                frame.rightFoot.history.distanceMoved.unshift(this.LimbDistance(frame.rightFoot, deltaFrame.rightFoot));
                frame.rightKnee.history.distanceMoved.unshift(this.LimbDistance(frame.rightKnee, deltaFrame.rightKnee));
                frame.leftHip.history.distanceMoved.unshift(this.LimbDistance(frame.leftHip, deltaFrame.leftHip));
                frame.rightHip.history.distanceMoved.unshift(this.LimbDistance(frame.rightHip, deltaFrame.rightHip));
            }
            f = f + 1;
        }
    };
    Positioner.prototype.Run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var firstPos, expertColor, noviceColor, deltas, bestDelta, nextDelta, timerId;
            var _this = this;
            return __generator(this, function (_a) {
                console.log("Loaded expert climber with " + expertRecording.frames.length + " frames");
                console.log("Loaded novice climber with " + noviceRecording.frames.length + " frames");
                console.log("Loaded route \"" + route.name + "\" with " + route.holds.length + " holds");
                // Add movement history and frames where limbs are on holds to each of the recordings
                this.AnnotateRecording(expertRecording, route);
                this.AnnotateRecording(noviceRecording, route);
                firstPos = noviceRecording.frames[0];
                expertColor = { red: 0.75, blue: 0.8, green: 0.8, alpha: 0.9 };
                noviceColor = { red: 0.4, blue: 0.9, green: 0.4, alpha: 1.0 };
                deltas = this.GetDeltas(expertRecording, firstPos);
                bestDelta = this.GetBestExpertFrame(deltas, firstPos);
                nextDelta = this.GetNextHoldChangeFrame(bestDelta, deltas, expertRecording);
                RenderSet.AddBodyPosition(deltas[this.curFrame].expertFrame, expertColor);
                RenderSet.AddBodyPosition(deltas[this.curFrame].noviceFrame, noviceColor);
                timerId = setInterval(function () {
                    _this.curFrame++;
                    if (_this.curFrame == expertRecording.frames.length) {
                        _this.curFrame = 0;
                    }
                    RenderSet.ClearBodyPositions();
<<<<<<< HEAD
                    RenderSet.AddBodyPosition(expertRecording.frames[_this.curFrame], expertColor);
                }, 250);
=======
                    RenderSet.AddBodyPosition(deltas[_this.curFrame].expertFrame, expertColor);
                    RenderSet.AddBodyPosition(deltas[_this.curFrame].noviceFrame, noviceColor);
                }, 1000);
>>>>>>> d801b4842493e0c5d42d9109df787e1ca44ebf6f
                return [2 /*return*/];
            });
        });
    };
    return Positioner;
}());
export { Positioner };
//# sourceMappingURL=positioner.js.map