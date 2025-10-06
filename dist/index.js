#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const init_1 = require("./commands/init");
const generate_1 = require("./commands/generate");
const update_1 = require("./commands/update");
const watch_1 = require("./commands/watch");
const validate_1 = require("./commands/validate");
const list_templates_1 = require("./commands/list-templates");
const config_1 = require("./commands/config");
const program = new commander_1.Command();
program
    .name('swagger-to-tanstack')
    .description('Generate TanStack Query hooks, types, and schemas from Swagger/OpenAPI specification')
    .version('3.0.0');
// Register all commands
(0, init_1.initCommand)(program);
(0, generate_1.generateCommand)(program);
(0, update_1.updateCommand)(program);
(0, watch_1.watchCommand)(program);
(0, validate_1.validateCommand)(program);
(0, list_templates_1.listTemplatesCommand)(program);
(0, config_1.configCommand)(program);
program.parse();
//# sourceMappingURL=index.js.map