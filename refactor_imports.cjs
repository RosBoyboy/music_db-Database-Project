const fs = require('fs');
const path = require('path');

const jsDir = path.join(__dirname, 'resources', 'js');

const componentMappings = {
    'MusicPlayer': '@/Components/Common/MusicPlayer',
    'TrackCard': '@/Components/Common/TrackCard',
    'PlaylistItem': '@/Components/User/PlaylistItem',
    'MainLayout': '@/Layouts/MainLayout',
    'PlayerContext': '@/Context/PlayerContext',
};

// Regex to find imports starting with . or .. or @
const importRegex = /import\s+(?:\{[^}]+\}|\S+)\s+from\s+['"]([^'"]+)['"]/g;

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Fix imports
    content = content.replace(/import\s+(?:(?:\w+\s*,?\s*|\{\s*\w+\s*,?\s*\})\s*)+from\s+['"]([^'"]+)['"]/g, (match, importPath) => {
        let newImportPath = importPath;
        
        // Map relative paths to absolute @ paths
        if (importPath.includes('MusicPlayer')) newImportPath = '@/Components/Common/MusicPlayer';
        else if (importPath.includes('TrackCard')) newImportPath = '@/Components/Common/TrackCard';
        else if (importPath.includes('PlaylistItem')) newImportPath = '@/Components/User/PlaylistItem';
        else if (importPath.includes('MainLayout')) newImportPath = '@/Layouts/MainLayout';
        else if (importPath.includes('PlayerContext')) newImportPath = '@/Context/PlayerContext';
        else if (importPath.includes('Components/')) {
            // some generic fix if needed
            if (importPath.includes('MusicPlayer')) newImportPath = '@/Components/Common/MusicPlayer';
        }

        if (newImportPath !== importPath) {
            changed = true;
            return match.replace(importPath, newImportPath);
        }
        return match;
    });

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed imports in', filePath);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            processFile(fullPath);
        }
    }
}

walkDir(jsDir);
