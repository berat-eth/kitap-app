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
exports.closeConnection = exports.getPool = exports.createConnection = void 0;
var promise_1 = require("mysql2/promise");
var env_1 = require("./env");
var pool = null;
var createConnection = function () { return __awaiter(void 0, void 0, void 0, function () {
    var poolConfig, connection, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (pool) {
                    return [2 /*return*/, pool];
                }
                poolConfig = {
                    host: env_1.config.database.host,
                    port: env_1.config.database.port,
                    user: env_1.config.database.user,
                    password: env_1.config.database.password,
                    database: env_1.config.database.name,
                    waitForConnections: true,
                    connectionLimit: 10,
                    queueLimit: 0,
                    enableKeepAlive: true,
                    keepAliveInitialDelay: 0,
                    // Uzak sunucu için timeout ayarları
                    connectTimeout: 60000, // 60 saniye
                    acquireTimeout: 60000,
                    timeout: 60000,
                };
                // SSL bağlantısı (eğer gerekiyorsa)
                if (env_1.config.database.ssl) {
                    poolConfig.ssl = {
                        rejectUnauthorized: env_1.config.database.sslRejectUnauthorized !== false,
                    };
                }
                pool = promise_1.default.createPool(poolConfig);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, pool.getConnection()];
            case 2:
                connection = _a.sent();
                return [4 /*yield*/, connection.ping()];
            case 3:
                _a.sent();
                connection.release();
                console.log('✅ Database connection established');
                return [3 /*break*/, 5];
            case 4:
                error_1 = _a.sent();
                console.error('❌ Database connection failed:', error_1);
                throw error_1;
            case 5: return [2 /*return*/, pool];
        }
    });
}); };
exports.createConnection = createConnection;
var getPool = function () {
    if (!pool) {
        throw new Error('Database pool not initialized. Call createConnection() first.');
    }
    return pool;
};
exports.getPool = getPool;
var closeConnection = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!pool) return [3 /*break*/, 2];
                return [4 /*yield*/, pool.end()];
            case 1:
                _a.sent();
                pool = null;
                console.log('Database connection closed');
                _a.label = 2;
            case 2: return [2 /*return*/];
        }
    });
}); };
exports.closeConnection = closeConnection;
