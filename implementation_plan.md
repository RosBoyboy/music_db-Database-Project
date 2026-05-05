# Implementation Plan: Search Page

You've provided a fantastic template for the Search UI. Since we are using a real backend database instead of a static `mockData` file, I will adapt your code to query our Laravel database dynamically!

## Proposed Changes

### 1. Backend Search Logic
- **[MODIFY]** `app/Http/Controllers/TrackController.php`:
  - Update the existing `search` method to return structured data for the UI tabs:
    - `$filteredTracks`: Query `tracks` table.
    - `$filteredArtists`: Query `artists` table.
    - `$filteredAlbums`: Query `albums` table.
    - `$filteredPlaylists`: Dummy data filtered based on the query since we don't have a table for this yet.
  - Render `Inertia::render('Search')` and pass these along with the current `q` query string.

### 2. Global Search Input
- **[MODIFY]** `resources/js/Layouts/MainLayout.jsx`:
  - Wire up the search bar in the Header. When you type, it will automatically hit the `/search?q=xyz` route via Inertia (without reloading the page).
  - Add the `Search` link to your Sidebar under "Explore".

### 3. Search UI Component
- **[NEW]** `resources/js/Pages/Search.jsx`:
  - Translate your `Search.tsx` file to standard React.
  - Replace the client-side `useMemo` filtering with the server-side props sent by Laravel (`filteredTracks`, etc.).
  - Implement the "All, Songs, Artists, Albums, Playlists" tab chips to toggle visibility.
  - Keep the empty state design with the category buttons.

## Open Questions
> [!NOTE]
> The current Controller code makes an API request to Spotify whenever a search is performed. For this UI update, do you want me to keep the Spotify integration (displaying results from Spotify alongside local data) or temporarily disable it so the UI perfectly matches your design mockup (which only shows local artists/albums/tracks)?

Let me know if this plan looks good to you so I can start integrating it!
