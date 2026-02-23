/**
 * ESLint Architecture Rules
 * 
 * This configuration enforces architectural boundaries between features.
 * Prevents cross-feature imports and ensures proper dependency direction.
 * 
 * @module eslint-architecture
 */

module.exports = {
  rules: {
    /**
     * Prevent imports from one feature into another feature's internals
     * 
     * Good: import { useTasks } from 'features/tasks'
     * Bad: import { taskStore } from 'features/tasks/store/taskStore'
     * Bad: import { projectService } from 'features/projects' (from within features/tasks)
     */
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          // Prevent deep imports into feature internals
          {
            group: ['features/*/store/*'],
            message: 'Import from feature index instead. Use: import { useTaskStore } from "features/tasks"',
          },
          {
            group: ['features/*/services/*'],
            message: 'Import from feature index instead. Use: import { taskService } from "features/tasks"',
          },
          {
            group: ['features/*/components/*'],
            message: 'Feature components are internal. Use shared components or feature index exports.',
          },
          {
            group: ['features/*/hooks/*'],
            message: 'Import from feature index instead. Use: import { useTasks } from "features/tasks"',
          },
          {
            group: ['features/*/types/*'],
            message: 'Import from feature index instead. Use: import { TaskStatus } from "features/tasks"',
          },
          {
            group: ['features/*/utils/*'],
            message: 'Feature utilities are internal. Move shared utilities to shared/ layer.',
          },
        ],
      },
    ],
    
    /**
     * Import order enforcement
     * Ensures consistent import ordering
     */
    'import/order': [
      'error',
      {
        groups: [
          'builtin',   // Node.js built-ins
          'external',  // npm packages
          'internal',  // Internal aliases (@/)
          'parent',    // Parent imports (../)
          'sibling',   // Sibling imports (./)
          'index',     // Index imports (./index)
        ],
        pathGroups: [
          {
            pattern: 'react',
            group: 'external',
            position: 'before',
          },
          {
            pattern: 'core/**',
            group: 'internal',
            position: 'before',
          },
          {
            pattern: 'shared/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: 'features/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: 'app/**',
            group: 'internal',
            position: 'after',
          },
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
  },
};

/**
 * Architecture Validation Script
 * 
 * Run this script to validate architectural boundaries.
 * 
 * Usage: node scripts/validate-architecture.js
 */

// This would be a separate script file
const validateArchitecture = () => {
  const fs = require('fs');
  const path = require('path');
  
  const violations = [];
  
  // Define feature boundaries
  const features = ['tasks', 'projects', 'notifications', 'settings'];
  const layers = {
    core: ['api', 'config', 'errors', 'router', 'store'],
    shared: ['ui', 'hooks', 'utils', 'types', 'contracts', 'events'],
    features: features,
    app: ['providers', 'router'],
  };
  
  // Check for cross-feature imports
  const checkFile = (filePath, content) => {
    const relativePath = path.relative(process.cwd(), filePath);
    
    // Skip non-JS files
    if (!/\.(js|jsx|ts|tsx)$/.test(filePath)) return;
    
    // Find which feature this file belongs to
    const featureMatch = relativePath.match(/features\/([^/]+)/);
    const currentFeature = featureMatch ? featureMatch[1] : null;
    
    // Check imports
    const importRegex = /import\s+.*from\s+['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      
      // Check for cross-feature imports
      if (currentFeature) {
        features.forEach((feature) => {
          if (feature !== currentFeature && importPath.includes(`features/${feature}`)) {
            violations.push({
              file: relativePath,
              import: importPath,
              rule: 'cross-feature-import',
              message: `Feature "${currentFeature}" cannot import from feature "${feature}". Use shared contracts instead.`,
            });
          }
        });
      }
      
      // Check for deep imports into features
      const deepImportMatch = importPath.match(/features\/([^/]+)\/(store|services|components|hooks|types|utils)\//);
      if (deepImportMatch) {
        violations.push({
          file: relativePath,
          import: importPath,
          rule: 'deep-feature-import',
          message: `Deep import into feature "${deepImportMatch[1]}" is not allowed. Import from feature index instead.`,
        });
      }
      
      // Check for core importing from features
      if (relativePath.startsWith('core/') && importPath.includes('features/')) {
        violations.push({
          file: relativePath,
          import: importPath,
          rule: 'core-feature-import',
          message: 'Core layer cannot import from features layer.',
        });
      }
      
      // Check for shared importing from features
      if (relativePath.startsWith('shared/') && importPath.includes('features/')) {
        violations.push({
          file: relativePath,
          import: importPath,
          rule: 'shared-feature-import',
          message: 'Shared layer cannot import from features layer.',
        });
      }
    }
  };
  
  // Walk directory
  const walkDir = (dir) => {
    const files = fs.readdirSync(dir);
    
    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else {
        const content = fs.readFileSync(filePath, 'utf8');
        checkFile(filePath, content);
      }
    });
  };
  
  // Run validation
  const srcPath = path.join(process.cwd(), 'src');
  if (fs.existsSync(srcPath)) {
    walkDir(srcPath);
  }
  
  // Report results
  if (violations.length > 0) {
    console.error('\n❌ Architecture Violations Detected:\n');
    violations.forEach((v) => {
      console.error(`  ${v.file}`);
      console.error(`    Import: ${v.import}`);
      console.error(`    Rule: ${v.rule}`);
      console.error(`    ${v.message}\n`);
    });
    process.exit(1);
  } else {
    console.log('✅ No architecture violations detected.');
    process.exit(0);
  }
};

// Export for use as module
module.exports.validateArchitecture = validateArchitecture;
