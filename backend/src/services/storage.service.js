"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
var fs_1 = require("fs");
var path_1 = require("path");
var storage_1 = require("../config/storage");
var logger_1 = require("../utils/logger");
var StorageService = /** @class */ (function () {
    function StorageService() {
    }
    StorageService.saveFile = function (type, file) {
        return __awaiter(this, void 0, void 0, function () {
            var filename, filePath, publicUrl;
            return __generator(this, function (_a) {
                filename = file.filename;
                filePath = (0, storage_1.getUploadPath)(type, filename);
                publicUrl = (0, storage_1.getPublicUrl)(filePath);
                logger_1.default.info("File saved: ".concat(filePath));
                return [2 /*return*/, { filePath: filePath, publicUrl: publicUrl }];
            });
        });
    };
    StorageService.deleteFile = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, storage_1.deleteFile)(filePath)];
                    case 1:
                        _a.sent();
                        logger_1.default.info("File deleted: ".concat(filePath));
                        return [2 /*return*/];
                }
            });
        });
    };
    StorageService.fileExists = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, fs_1.default.existsSync(filePath)];
            });
        });
    };
    StorageService.getFileSize = function (filePath) {
        try {
            var stats = fs_1.default.statSync(filePath);
            return stats.size;
        }
        catch (error) {
            logger_1.default.error("Error getting file size for ".concat(filePath, ":"), error);
            return 0;
        }
    };
    StorageService.moveFile = function (oldPath, newPath) {
        return __awaiter(this, void 0, void 0, function () {
            var dir;
            return __generator(this, function (_a) {
                try {
                    dir = path_1.default.dirname(newPath);
                    if (!fs_1.default.existsSync(dir)) {
                        fs_1.default.mkdirSync(dir, { recursive: true });
                    }
                    fs_1.default.renameSync(oldPath, newPath);
                    logger_1.default.info("File moved from ".concat(oldPath, " to ").concat(newPath));
                }
                catch (error) {
                    logger_1.default.error("Error moving file from ".concat(oldPath, " to ").concat(newPath, ":"), error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    return StorageService;
}());
exports.StorageService = StorageService;
