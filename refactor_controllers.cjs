const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    for (const [search, replace] of replacements) {
        if (content.includes(search)) {
            content = content.replace(new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replace);
            changed = true;
        }
    }
    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated ' + filePath);
    }
}

const controllersDir = path.join(__dirname, 'app', 'Http', 'Controllers');
const routesFile = path.join(__dirname, 'routes', 'web.php');

// TrackController
replaceInFile(path.join(controllersDir, 'TrackController.php'), [
    ["Inertia::render('Home'", "Inertia::render('User/Home'"],
    ["Inertia::render('Explore'", "Inertia::render('User/Explore'"],
    ["Inertia::render('Search'", "Inertia::render('User/Search'"],
    ["Inertia::render('ArtistProfile'", "Inertia::render('User/ArtistProfile'"],
    ["Inertia::render('PlaylistView'", "Inertia::render('User/PlaylistView'"],
]);

// SearchController
replaceInFile(path.join(controllersDir, 'SearchController.php'), [
    ["Inertia::render('Search'", "Inertia::render('User/Search'"],
]);

// ProfileController
replaceInFile(path.join(controllersDir, 'ProfileController.php'), [
    ["Inertia::render('Profile/Edit'", "Inertia::render('User/Profile/Edit'"],
]);

// PlaylistController
replaceInFile(path.join(controllersDir, 'PlaylistController.php'), [
    ["Inertia::render('Playlists/Create'", "Inertia::render('User/Playlists/Create'"],
    ["Inertia::render('Playlists/Show'", "Inertia::render('User/Playlists/Show'"],
]);

// LibraryController
replaceInFile(path.join(controllersDir, 'LibraryController.php'), [
    ["Inertia::render('LikedSongs'", "Inertia::render('User/LikedSongs'"],
    ["Inertia::render('History'", "Inertia::render('User/History'"],
]);

// AdminController - already points to Admin/Dashboard, Admin/Users, Admin/Tracks

// routes/web.php
replaceInFile(routesFile, [
    ["Inertia::render('Landing')", "Inertia::render('Guest/Landing')"],
    ["Inertia::render('Upload')", "Inertia::render('Artist/Dashboard')"],
]);

console.log('Done modifying controllers and routes.');
