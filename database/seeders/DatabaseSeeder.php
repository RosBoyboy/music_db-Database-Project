<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Models\Artist;
use App\Models\Album;
use App\Models\Track;
use App\Models\Genre;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ─── Subscription Plans ───────────────────────────────────
        $freePlan    = SubscriptionPlan::create(['name' => 'Free',    'price' => 0.00]);
        $premiumPlan = SubscriptionPlan::create(['name' => 'Premium', 'price' => 9.99]);

        $adminRole = \App\Models\Role::firstOrCreate(['name' => 'admin']);
        $artistRole = \App\Models\Role::firstOrCreate(['name' => 'artist']);
        $userRole = \App\Models\Role::firstOrCreate(['name' => 'user']);

        $adminUser = User::factory()->create([
            'name'                 => 'Admin User',
            'email'                => 'admin@example.com',
            'password'             => bcrypt('password'),
            'subscription_plan_id' => $premiumPlan->id,
        ]);
        $adminUser->roles()->attach($adminRole->id);
        User::factory(5)->create(['subscription_plan_id' => $freePlan->id]);

        // ─── Genres ───────────────────────────────────────────────
        $genreMap = [];
        foreach (['Pop', 'R&B', 'Hip Hop', 'Indie', 'Electronic', 'Rock'] as $g) {
            $genreMap[$g] = Genre::create(['name' => $g]);
        }

        // ─── Real Artist / Album / Track Data ─────────────────────
        $catalog = [
            [
                'name'      => 'Taylor Swift',
                'image_url' => 'https://i.scdn.co/image/ab6761610000e5eb5a00969a4698c3132a15fbb0',
                'albums'    => [
                    [
                        'name'         => 'Midnights',
                        'release_date' => '2022-10-21',
                        'image_url'    => 'https://i.scdn.co/image/ab67616d0000b273bb54dde68cd23e2a268ae0f5',
                        'tracks'       => ['Lavender Haze', 'Maroon', 'Anti-Hero', 'Snow on the Beach', 'Midnight Rain', 'Question...?', 'Vigilante Shit', 'Bejeweled', 'Labyrinth', 'Karma'],
                        'genres'       => ['Pop'],
                    ],
                    [
                        'name'         => 'Lover',
                        'release_date' => '2019-08-23',
                        'image_url'    => 'https://i.scdn.co/image/ab67616d0000b273e787cffec20aa2a396a61647',
                        'tracks'       => ['I Forgot That You Existed', 'Cruel Summer', 'Lover', 'The Man', 'The Archer', 'I Think He Knows', 'Cornelia Street', 'Death By A Thousand Cuts'],
                        'genres'       => ['Pop'],
                    ],
                ],
            ],
            [
                'name'      => 'The Weeknd',
                'image_url' => 'https://i.scdn.co/image/ab6761610000e5eb214f3cf1cbe7139c1e26ffbb',
                'albums'    => [
                    [
                        'name'         => 'After Hours',
                        'release_date' => '2020-03-20',
                        'image_url'    => 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36',
                        'tracks'       => ['Alone Again', 'Too Late', 'Hardest to Love', 'Scared to Live', 'Snowchild', 'Escape from LA', 'Heartless', 'Faith', 'Blinding Lights', 'In Your Eyes'],
                        'genres'       => ['R&B', 'Pop'],
                    ],
                    [
                        'name'         => 'Dawn FM',
                        'release_date' => '2022-01-07',
                        'image_url'    => 'https://i.scdn.co/image/ab67616d0000b273a048415db06a5b6fa7ec4e1a',
                        'tracks'       => ['Gasoline', 'How Do I Make You Love Me?', 'Take My Breath', 'Sacrifice', 'A Tale By Quincy', 'Out of Time', 'Here We Go... Again', 'Best Friends', 'Is There Someone Else?', 'Starry Eyes'],
                        'genres'       => ['R&B', 'Pop'],
                    ],
                ],
            ],
            [
                'name'      => 'Drake',
                'image_url' => 'https://i.scdn.co/image/ab6761610000e5eb4293385d324db8558179afd9',
                'albums'    => [
                    [
                        'name'         => 'Certified Lover Boy',
                        'release_date' => '2021-09-03',
                        'image_url'    => 'https://i.scdn.co/image/ab67616d0000b273b1c4b76e23414c9f20242268',
                        'tracks'       => ['Champagne Poetry', 'TSU', 'Way 2 Sexy', 'Champagne Poetry', 'Fair Trade', 'Love All', 'N 2 Deep', 'Papi\'s Home', 'Girls Want Girls', 'In The Bible'],
                        'genres'       => ['Hip Hop', 'R&B'],
                    ],
                ],
            ],
            [
                'name'      => 'Billie Eilish',
                'image_url' => 'https://i.scdn.co/image/ab6761610000e5ebd8b9980492793fc4b1f48b64',
                'albums'    => [
                    [
                        'name'         => 'Happier Than Ever',
                        'release_date' => '2021-07-30',
                        'image_url'    => 'https://i.scdn.co/image/ab67616d0000b273a5c4a30e5e32f88d9de05fa0',
                        'tracks'       => ['Getting Older', 'I Didn\'t Change My Number', 'Billie Bossa Nova', 'my future', 'Oxytocin', 'GOLDWING', 'Lost Cause', 'Halley\'s Comet', 'Not My Responsibility', 'OverHeated', 'Everybody Dies', 'Your Power', 'NDA', 'Therefore I Am', 'Happier Than Ever', 'Male Fantasy'],
                        'genres'       => ['Pop', 'Indie'],
                    ],
                ],
            ],
            [
                'name'      => 'Ed Sheeran',
                'image_url' => 'https://i.scdn.co/image/ab6761610000e5eb3bcef85e105dfc42399ef0ba',
                'albums'    => [
                    [
                        'name'         => '=',
                        'release_date' => '2021-10-29',
                        'image_url'    => 'https://i.scdn.co/image/ab67616d0000b2732e8ed79e177ff6011076f5f0',
                        'tracks'       => ['Tides', 'Shivers', 'First Times', 'Bad Habits', 'Overpass Graffiti', 'The Great War', 'Maze', 'Bad Habits', 'Visiting Hours', 'Collide', 'Forever My Love', 'The Joker And The Queen', 'Leave Your Life', 'Sandman'],
                        'genres'       => ['Pop'],
                    ],
                ],
            ],
            [
                'name'      => 'Dua Lipa',
                'image_url' => 'https://i.scdn.co/image/ab6761610000e5eb1ba8fc5f5c73e7e24751138d',
                'albums'    => [
                    [
                        'name'         => 'Future Nostalgia',
                        'release_date' => '2020-03-27',
                        'image_url'    => 'https://i.scdn.co/image/ab67616d0000b2734bc66095f8a70bc4e6593f4f',
                        'tracks'       => ['Future Nostalgia', 'Don\'t Start Now', 'Cool', 'Physical', 'Levitating', 'Pretty Please', 'Hallucinate', 'Love Again', 'Break My Heart', 'Good in Bed', 'Boys Will Be Boys'],
                        'genres'       => ['Pop', 'Electronic'],
                    ],
                ],
            ],
            [
                'name'      => 'Post Malone',
                'image_url' => 'https://i.scdn.co/image/ab6761610000e5eb6be070445b03e7b0a8a36eb9',
                'albums'    => [
                    [
                        'name'         => "Hollywood's Bleeding",
                        'release_date' => '2019-09-06',
                        'image_url'    => 'https://i.scdn.co/image/ab67616d0000b273b1c4b76e23414c9f20242268',
                        'tracks'       => ["Hollywood's Bleeding", 'Enemies', 'Circles', 'Wow.', 'Die For Me', 'Only Wanna Be With You', 'Internet', 'Saint-Tropez', 'Allergic', 'A Thousand Bad Times', 'Cooped Up', 'Reputation', 'On The Road', 'Take What You Want', 'Myself', 'Staring At The Sun', 'I\'m Gonna Be', 'Goodbyes'],
                        'genres'       => ['Hip Hop', 'Pop'],
                    ],
                ],
            ],
            [
                'name'      => 'Harry Styles',
                'image_url' => 'https://i.scdn.co/image/ab6761610000e5eb8ee9a6f6dc1c314c4b5b6e59',
                'albums'    => [
                    [
                        'name'         => "Harry's House",
                        'release_date' => '2022-05-20',
                        'image_url'    => 'https://i.scdn.co/image/ab67616d0000b2732e8ed79e177ff6011076f5f0',
                        'tracks'       => ['Music for a Sushi Restaurant', 'Late Night Talking', 'Grapejuice', 'As It Was', 'Daylight', 'Little Freak', 'Matilda', 'Cinema', 'Daydreaming', 'Keep Driving', 'Satellite', 'Boyfriend', 'Love of My Life'],
                        'genres'       => ['Pop', 'Indie'],
                    ],
                ],
            ],
            [
                'name'      => 'Kendrick Lamar',
                'image_url' => 'https://i.scdn.co/image/ab6761610000e5eb437b9e2a82505b3d93ff1022',
                'albums'    => [
                    [
                        'name'         => 'Mr. Morale & The Big Steppers',
                        'release_date' => '2022-05-13',
                        'image_url'    => 'https://i.scdn.co/image/ab67616d0000b2732e8ed79e177ff6011076f5f0',
                        'tracks'       => ['United in Grief', 'N95', 'Worldwide Steppers', 'Die Hard', 'Father Time', 'Rich', 'Purple Hearts', 'Count Me Out', 'Crown', 'Silent Hill', 'Savior', 'Savior Interlude', 'Auntie Diaries', 'Mr. Morale', 'Mother I Sober', 'Mirror'],
                        'genres'       => ['Hip Hop'],
                    ],
                ],
            ],
            [
                'name'      => 'Olivia Rodrigo',
                'image_url' => 'https://i.scdn.co/image/ab6761610000e5eb679e2e1c0a568b6f4c73fc1c',
                'albums'    => [
                    [
                        'name'         => 'SOUR',
                        'release_date' => '2021-05-21',
                        'image_url'    => 'https://i.scdn.co/image/ab67616d0000b27344516da9e2f05c3a0f4b9ddd',
                        'tracks'       => ['brutal', 'traitor', 'drivers license', 'deja vu', 'good 4 u', '1 step forward, 3 steps back', 'enough for you', 'happier', 'favorite crime', 'hope ur ok'],
                        'genres'       => ['Pop', 'Indie'],
                    ],
                    [
                        'name'         => 'GUTS',
                        'release_date' => '2023-09-08',
                        'image_url'    => 'https://i.scdn.co/image/ab67616d0000b273e85259a1cae29a8d91f2093d',
                        'tracks'       => ['vampire', 'bad idea right?', 'get him back!', 'lacy', 'ballad of a homeschooled girl', 'making the bed', 'logical', 'get him back!', 'all-american bitch', 'pretty isn\'t pretty', 'teenage dream', 'the grudge', 'love is embarrassing', 'pretty isn\'t pretty'],
                        'genres'       => ['Pop', 'Indie'],
                    ],
                ],
            ],
        ];

        foreach ($catalog as $artistData) {
            $artist = Artist::create([
                'name'      => $artistData['name'],
                'image_url' => $artistData['image_url'],
            ]);

            foreach ($artistData['albums'] as $albumData) {
                $album = Album::create([
                    'name'         => $albumData['name'],
                    'artist_id'    => $artist->id,
                    'release_date' => $albumData['release_date'],
                    'image_url'    => $albumData['image_url'],
                ]);

                foreach ($albumData['tracks'] as $index => $trackName) {
                    $track = Track::create([
                        'name'             => $trackName,
                        'artist_id'        => $artist->id,
                        'album_id'         => $album->id,
                        'duration_seconds' => rand(160, 280),
                        'play_count'       => rand(100000, 9999999),
                    ]);

                    // Attach genres
                    $genreKeys = $albumData['genres'];
                    $genreIds  = collect($genreKeys)
                        ->map(fn($g) => $genreMap[$g]->id ?? null)
                        ->filter()
                        ->toArray();
                    $track->genres()->attach($genreIds);
                }
            }
        }
    }
}
