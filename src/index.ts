#!/usr/bin/env node
import { Command } from 'commander';
import { initCommand } from './commands/init';
import { generateCommand } from './commands/generate';
import { updateCommand } from './commands/update';
import { watchCommand } from './commands/watch';
import { validateCommand } from './commands/validate';
import { listTemplatesCommand } from './commands/list-templates';
import { configCommand } from './commands/config';

const program = new Command();

program
  .name('swagger-to-tanstack')
  .description('Generate TanStack Query hooks, types, and schemas from Swagger/OpenAPI specification')
  .version('3.0.0');

// Register all commands
initCommand(program);
generateCommand(program);
updateCommand(program);
watchCommand(program);
validateCommand(program);
listTemplatesCommand(program);
configCommand(program);

program.parse();