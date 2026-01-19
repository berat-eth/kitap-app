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
exports.uploadConfig = exports.deleteFile = exports.getPublicUrl = exports.getUploadPath = exports.ensureUploadDirectories = void 0;
var fs_1 = require("fs");
var path_1 = require("path");
// Fix: config.upload is not defined, use direct access
var UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
var ensureUploadDirectories = function () {
    var directories = [
        UPLOAD_DIR,
        path_1.default.join(UPLOAD_DIR, 'covers'),
        path_1.default.join(UPLOAD_DIR, 'audio'),
        path_1.default.join(UPLOAD_DIR, 'audio', 'books'),
        path_1.default.join(UPLOAD_DIR, 'audio', 'chapters'),
        path_1.default.join(UPLOAD_DIR, 'avatars'),
    ];
    directories.forEach(function (dir) {
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
            console.log("Created directory: ".concat(dir));
        }
    });
};
exports.ensureUploadDirectories = ensureUploadDirectories;
var getUploadPath = function (type, filename) {
    var now = new Date();
    var year = now.getFullYear();
    var month = String(now.getMonth() + 1).padStart(2, '0');
    var baseDir;
    switch (type) {
        case 'cover':
            baseDir = path_1.default.join(UPLOAD_DIR, 'covers');
            break;
        case 'audio':
            baseDir = path_1.default.join(UPLOAD_DIR, 'audio', 'chapters', String(year), month);
            break;
        case 'avatar':
            baseDir = path_1.default.join(UPLOAD_DIR, 'avatars');
            break;
        default:
            baseDir = UPLOAD_DIR;
    }
    // Ensure directory exists
    if (!fs_1.default.existsSync(baseDir)) {
        fs_1.default.mkdirSync(baseDir, { recursive: true });
    }
    return path_1.default.join(baseDir, filename);
};
exports.getUploadPath = getUploadPath;
var getPublicUrl = function (filePath) {
    // Remove upload directory from path to get relative path
    var relativePath = filePath.replace(UPLOAD_DIR, '').replace(/\\/g, '/');
    return "/uploads".concat(relativePath);
};
exports.getPublicUrl = getPublicUrl;
var deleteFile = function (filePath) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
        }
        catch (error) {
            console.error("Error deleting file ".concat(filePath, ":"), error);
        }
        return [2 /*return*/];
    });
}); };
exports.deleteFile = deleteFile;
// Export config for upload middleware
exports.uploadConfig = {
    uploadDir: UPLOAD_DIR,
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '524288000', 10),
    maxCoverSize: parseInt(process.env.MAX_COVER_SIZE || '5242880', 10),
};
