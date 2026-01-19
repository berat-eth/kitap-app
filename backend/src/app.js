"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
var express_1 = require("express");
var cors_1 = require("cors");
var helmet_1 = require("helmet");
var compression_1 = require("compression");
var express_rate_limit_1 = require("express-rate-limit");
var env_1 = require("./config/env");
var storage_1 = require("./config/storage");
var error_middleware_1 = require("./middleware/error.middleware");
// Routes
var device_routes_1 = require("./routes/device.routes");
var admin_auth_routes_1 = require("./routes/admin-auth.routes");
var books_routes_1 = require("./routes/books.routes");
var chapters_routes_1 = require("./routes/chapters.routes");
var categories_routes_1 = require("./routes/categories.routes");
var progress_routes_1 = require("./routes/progress.routes");
var favorites_routes_1 = require("./routes/favorites.routes");
var downloads_routes_1 = require("./routes/downloads.routes");
var admin_routes_1 = require("./routes/admin.routes");
var public_routes_1 = require("./routes/public.routes");
var upload_routes_1 = require("./routes/upload.routes");
var createApp = function () {
    var app = (0, express_1.default)();
    // Security middleware
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({
        origin: env_1.config.cors.origin,
        credentials: true,
    }));
    // Body parsing
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    // Compression
    app.use((0, compression_1.default)());
    // Rate limiting
    var limiter = (0, express_rate_limit_1.default)({
        windowMs: env_1.config.rateLimit.windowMs,
        max: env_1.config.rateLimit.maxRequests,
        message: 'Too many requests from this IP, please try again later.',
    });
    var adminLimiter = (0, express_rate_limit_1.default)({
        windowMs: env_1.config.rateLimit.windowMs,
        max: env_1.config.rateLimit.adminMaxRequests,
        message: 'Too many requests from this IP, please try again later.',
    });
    app.use('/api/', limiter);
    app.use('/api/admin/', adminLimiter);
    // Ensure upload directories exist
    (0, storage_1.ensureUploadDirectories)();
    // Health check
    app.get('/health', function (_req, res) {
        res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        });
    });
    // API Routes
    app.use('/api/device', device_routes_1.default);
    app.use('/api/admin/auth', admin_auth_routes_1.default);
    app.use('/api/books', books_routes_1.default);
    app.use('/api/chapters', chapters_routes_1.default);
    app.use('/api/categories', categories_routes_1.default);
    app.use('/api/progress', progress_routes_1.default);
    app.use('/api/favorites', favorites_routes_1.default);
    app.use('/api/downloads', downloads_routes_1.default);
    app.use('/api/admin', admin_routes_1.default);
    app.use('/api/public', public_routes_1.default);
    app.use('/api/upload', upload_routes_1.default);
    // Serve uploaded files
    app.use('/uploads', express_1.default.static(storage_1.uploadConfig.uploadDir));
    // Error handling
    app.use(error_middleware_1.notFoundHandler);
    app.use(error_middleware_1.errorHandler);
    return app;
};
exports.createApp = createApp;
