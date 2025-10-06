"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTemplatesCommand = listTemplatesCommand;
function listTemplatesCommand(program) {
    program
        .command('list-templates')
        .description('List all available templates and structure modes')
        .action(() => {
        console.log('\n📚 Available Templates:\n');
        console.log('  1. tanstack-query    - TanStack Query (React Query v5)');
        console.log('     Compatible: split, group, group-hooks\n');
        console.log('  2. rtk-query         - RTK Query (Redux Toolkit)');
        console.log('     Compatible: group-hooks only');
        console.log('     Auto-generates: src/services/config.ts\n');
        console.log('  3. swr               - SWR (Vercel)');
        console.log('     Compatible: group-hooks only\n');
        console.log('  4. react-query-kit   - React Query Kit');
        console.log('     Compatible: group-hooks only\n');
        console.log('  5. basic             - useState/useEffect');
        console.log('     Compatible: group-hooks only\n');
        console.log('🏗️  Structure Modes:\n');
        console.log('  • split        - api/, queries/, mutations/');
        console.log('  • group        - api.ts, queries.ts, mutations.ts');
        console.log('  • group-hooks  - api.ts, hooks.ts (recommended)\n');
        console.log('🌐 HTTP Clients:\n');
        console.log('  • fetch (default)  • axios\n');
        console.log('✅ Validators:\n');
        console.log('  • zod (default)    • yup\n');
        console.log('💡 Examples:\n');
        console.log('  swagger-to-tanstack generate -i ./swagger.json \\');
        console.log('    -t tanstack-query -s split --http-client axios\n');
        console.log('  swagger-to-tanstack generate -i ./swagger.json \\');
        console.log('    --include-tags users,roles --exclude-tags admin\n');
    });
}
//# sourceMappingURL=list-templates.js.map