# Netflix-Style Streaming Platform — Master Prompt

> **BEFORE YOU START:** Ask the user for the following before writing anything:
> their custom logo file or URL, their TMDB API key, their MongoDB connection URI, their preferred app name, and their primary brand color (or confirm they want Netflix red `#E50914`). Do not proceed until these are provided.

---

## What You Are Building

You are building a fully featured, production-quality streaming platform that looks, feels, and behaves exactly like Netflix — but with the user's own branding, logo, and identity. Every interaction, animation, transition, hover state, focus ring, and loading state must feel indistinguishable from Netflix in terms of polish and smoothness. This is not a prototype. This is not a demo. Every screen must be fully functional with real live data from the TMDB API.

The platform consists of three completely separate, fully isolated applications: a web app, an Android mobile app, and an Android TV app. These three apps share no code, no components, no utilities, and no configuration files. Each is its own self-contained project built with the appropriate technology for its platform. They are united only by the same MongoDB backend, the same TMDB data source, and the same design language.

---

## Design Language and Visual Identity

The entire platform is built on a dark theme. The background is near-black at `#141414`. All surfaces layer upward in lightness: `#181818` for cards and panels, `#232323` for elevated elements, `#2F2F2F` for the highest surfaces. The accent color is red — `#E50914` — used for primary buttons, active states, progress bars, focus rings on TV, and the logo if the user has not supplied their own. Text is white at full opacity for primary content, `#B3B3B3` for secondary labels and metadata, and `#737373` for muted captions and placeholders. Borders are white at 10% opacity.

Typography uses Netflix Sans as the primary font with Inter as the fallback. Headings are bold and large. Body text is clean and legible at small sizes. Nothing should feel cramped or cluttered.

Every interactive element must have a visible, intentional state for default, hover, focus, active, and disabled. On web, hover states are rich and animated. On mobile, tap states use haptic-appropriate feedback. On TV, focus states use a visible red border ring so the user always knows where they are.

---

## Animations and Motion

Animation is not optional. It is core to the Netflix experience. Every animation listed below must be implemented exactly as described.

When a user hovers over a content card on web, the card must wait 400 milliseconds before reacting — this prevents cards from exploding open as the mouse passes over a row. After the delay, the card scales up to 1.2 times its original size, lifts slightly with a negative Y translation of 8 pixels, and reveals an expanded panel beneath it showing the title, star rating, genre chips, a play button, an add-to-list button, a like/dislike button, and a more info button. This expansion takes 200 milliseconds with an ease-out curve. Cards at the beginning of a row expand to the right. Cards at the end expand to the left. Cards in the middle expand symmetrically. The expanded card must never clip outside the row's visible area.

The hero banner at the top of the home screen must auto-rotate through the top five trending titles every six seconds. The transition between titles is a cross-fade lasting 800 milliseconds. While a title is active, its backdrop image fills the full width of the viewport and fades into the dark background at the bottom via a gradient. The title's logo or name is displayed in large text. A short synopsis is shown beneath it. Two buttons sit below that: Play and More Info.

Modals and detail screens open with a subtle scale-from-95%-to-100% combined with a fade-in over 250 milliseconds. They close with the reverse.

Page transitions fade between 150 and 200 milliseconds.

All loading states use a shimmer skeleton — a dark grey rectangle with a lighter grey wave animation passing across it from left to right, looping continuously until content loads. Every card, every row label, every hero banner must show a skeleton before its data arrives.

Row scrolling on web must support both click-to-advance arrow buttons and drag-to-scroll with momentum. On mobile, swiping a row scrolls it. On TV, the D-pad moves focus through cards in a row and between rows.

---

## Content and Data

All content comes from the TMDB API version 3. There is no mock data anywhere in the application. The app must fetch trending content, popular movies, popular TV shows, top-rated titles, new releases, content by genre, search results, title details, cast and crew, trailers and videos, recommendations, similar titles, season and episode details, and backdrop and logo images. Images are loaded from the TMDB image CDN using the correct size variants for each context — smaller sizes for cards, larger sizes for backdrops and hero banners, original size for full-screen displays.

Genre rows are generated dynamically by fetching the genre list from TMDB and then fetching content for each genre. The home screen must have a minimum of ten content rows including Trending Now, Continue Watching, My List, Top 10 in Your Country, New Releases, Popular on the Platform, Because You Watched rows based on viewing history, and at least four genre-specific rows.

The Top 10 row uses a distinctive card design with a large semi-transparent rank number partially overlapping the left edge of the card poster, exactly as Netflix displays it.

---

## User Accounts and Profiles

Users sign up with an email and password or through Google OAuth. Passwords are hashed before storage. Sessions are managed securely. There is a forgot-password flow with email-based reset.

Each account supports up to five profiles. Profiles are separate identities with their own watch history, watchlist, ratings, preferences, and continue-watching progress. When a user opens the app, they see a full-screen profile picker — a grid of profile avatars on a dark background, exactly like Netflix's "Who's watching?" screen. Each avatar is a large circular image with the profile name beneath it. There is a Manage Profiles option. Selecting a profile that has a PIN set shows a PIN entry screen before proceeding.

Profile creation allows choosing from a grid of preset avatar images, entering a display name, setting a maturity rating level, and optionally enabling a PIN lock. A Kids profile mode restricts content to titles at or below the selected maturity rating and adjusts the UI to show only appropriate content.

---

## Player

The player is a full-screen experience. It wraps an iframe element for the actual stream, but everything surrounding that iframe must be built from scratch and must feel like the Netflix player.

The player overlay shows the title and episode information in the top-left corner. In the top-right corner there are buttons for subtitles, audio track selection, quality selection, and an exit button. At the bottom there is a progress bar that shows elapsed and total duration and allows scrubbing. To the left of the scrubber are play/pause, seek back ten seconds, and seek forward ten seconds buttons. To the right are volume control and fullscreen toggle.

When the user is inactive for three seconds, the overlay fades out. Moving the mouse or pressing any key brings it back. On TV, pressing any D-pad button brings the overlay back.

A Skip Intro button appears in the bottom-right corner at the appropriate timestamp if intro data is available, and disappears automatically if not clicked. A Skip Recap button appears at the start of episodes when recap data is available. When an episode ends, a card slides in from the bottom-right showing the next episode's thumbnail, title, and episode number, with a circular countdown timer indicating that it will auto-advance in five seconds. The user can click to advance immediately or dismiss the card to stay on the end screen.

Every ten seconds while content is playing, the player writes the current timestamp and percentage watched to MongoDB so that Continue Watching is always accurate. When the user exits the player and returns to the detail view, the card for that title shows a red progress bar indicating how far through it they got.

On web, the player supports keyboard shortcuts: spacebar for play and pause, F for fullscreen, M for mute, and left and right arrow keys for seeking ten seconds backward or forward. Picture-in-picture is supported on web and mobile.

---

## Search

The search bar is always visible in the top navigation on web and mobile. On TV, search is a dedicated screen accessible from the sidebar. As the user types, results appear instantly with a 300-millisecond debounce. Results are organized into tabs for Movies, TV Shows, and People. Each result shows a thumbnail, title, year, and rating.

Below the search input, before the user types anything, the screen shows a row of trending searches from TMDB and a row of the user's recent searches pulled from their profile in MongoDB. Recent searches can be individually dismissed. On mobile and TV, voice search is supported.

Filter chips appear below the search input allowing the user to narrow results by genre, content type, release year range, and rating threshold.

---

## Watchlist and Continue Watching

The My List feature allows users to save any title from any card hover state, any detail view, or any browse page. The button toggles between Add and Remove with an animated checkmark transition. The My List row appears on the home screen and there is a dedicated My List page accessible from the navigation.

Continue Watching appears as the second row on the home screen, directly below the hero banner. Each card in the row shows the title's backdrop image with a red progress bar at the bottom indicating percentage watched. On hover, the card shows a resume button and a three-dot menu with the option to remove the title from Continue Watching. Removing it triggers a smooth card exit animation collapsing the gap left behind.

---

## Detail View

Clicking More Info on any card or hero banner opens the detail view. On web this is a modal that slides up over the current page. On mobile and TV it is a dedicated screen.

The top of the detail view shows the title's backdrop with its trailer playing automatically on mute in a loop. The title logo or name is overlaid in the bottom-left. Below the backdrop are the Play button, Add to My List button, and Like/Dislike/Loved buttons styled as Netflix's thumbs system. Metadata shows the year, maturity rating, duration or number of seasons, and genre tags. The full synopsis is shown beneath that.

For TV shows, a Seasons and Episodes section appears below the synopsis. A dropdown or tab allows switching between seasons. Each season shows a vertical list of episode cards, each with the episode still image, episode number and title, air date, runtime, and a one-paragraph synopsis. Episodes that have been watched show a progress bar on their still image.

A More Like This section shows a grid of similar titles as cards. A Cast section shows a horizontally scrollable list of cast members with their photo, name, and character name. Clicking a cast member navigates to a filtered browse of their work.

Users can leave a star rating from one to five on any title. They can share a link to the title. On mobile, a Download button saves the title to an offline list with a status indicator.

---

## Landing Page

The landing page is shown to unauthenticated users and serves as the primary marketing surface. It must be beautiful, high-impact, and immediately communicative of what the platform offers.

The hero section occupies the full viewport height. A collage of movie and show artwork — pulled live from TMDB trending — fills the background with a dark overlay. The platform's logo sits at the top-left. A Sign In button sits at the top-right. Centered in the viewport is a bold headline no longer than ten words, a one-sentence subline, an email input field, and a large red Get Started button. The background artwork subtly animates — slowly zooming or fading between images.

Below the hero are three feature sections that alternate text and visual content. These communicate the platform's core value propositions: watching on any device, downloading for offline viewing, and creating multiple profiles for different people in a household. Each section has a large headline, a short paragraph, and an animated graphic or looping video.

A frequently asked questions section with at least five questions uses an accordion — clicking a question smoothly expands its answer, and clicking again collapses it. Only one answer is open at a time.

A footer contains organized link columns for legal pages, language selection, and copyright information.

The entire landing page must be fully responsive and look excellent on mobile viewports, with the hero stacking vertically and font sizes scaling appropriately.

---

## Web Navigation

The top navigation bar starts transparent and transitions to a solid dark background when the user scrolls down more than 80 pixels. This transition is smooth and takes around 200 milliseconds.

The left side of the nav contains the platform logo and a Browse dropdown menu. The dropdown contains links to Home, Movies, TV Shows, New and Popular, and My List. The dropdown appears on hover with a smooth fade-in and slight downward slide.

The right side contains a search icon that expands into a full search input when clicked, a notification bell with a dropdown showing recently added titles and personalized recommendations, and the user's profile avatar. Clicking the avatar opens a dropdown with quick-access links to the current profile, other profiles, account settings, and sign out.

---

## Mobile Navigation

The bottom tab bar has five tabs: Home, Search, Downloads, My List, and Profile. The active tab uses a white icon and label. Inactive tabs use the muted grey color. There is no visible border above the tab bar — instead it fades into the dark content above it via a gradient. Tab switching is instant with no visible transition delay.

The top of each mobile screen shows the platform logo centered or left-aligned depending on the screen, with contextually appropriate action buttons on the right.

---

## Android TV Navigation

The left sidebar is always present but collapsed to a narrow strip showing only icons when not in focus. When the user navigates to it with the D-pad, it smoothly expands to show full labels next to each icon. The expansion animation takes 250 milliseconds with an ease-out curve. The sidebar contains Home, Movies, TV Shows, Search, My List, Settings, and the user's profile.

The currently focused sidebar item shows a red left border, white text, and a subtle lighter background. All other items use the muted grey color.

D-pad navigation must work intuitively on every screen. Moving right from the sidebar moves focus into the content grid. Moving up and down navigates between rows. Moving left and right navigates between cards within a row. Pressing select on a card opens its detail screen. Pressing the back button returns to the previous screen or closes an overlay. There must never be a state where focus is lost or the user cannot navigate somewhere.

Every focusable element on TV must have a clearly visible focus ring — a 2-pixel red border with 8-pixel border radius. There is no mouse interaction on the TV app.

---

## Onboarding

First-time users who have just created an account are shown an onboarding flow before reaching the home screen. The flow has three animated screens presented as a horizontal slider or page scroll. The first explains what the platform offers with a visual of content browsing. The second explains offline downloads with an animation of a title being saved. The third explains multi-profile support with an illustration of the profile picker. Each screen has a headline, a short sentence, and navigation dots showing progress.

After the three informational screens, the user is shown a genre preference picker. A grid of genre tiles is presented — each with a representative image and genre name. The user must select at least three. These selections are saved to their profile in MongoDB and used to personalize their home screen rows immediately.

---

## Settings and Account Management

The settings area covers the following: account information including email and password change, subscription status and plan details, a manage profiles page allowing creating, editing, and deleting profiles, playback settings including toggles for autoplay next episode and autoplay previews and a data saver mode, language and subtitle preferences saved per profile, notification preferences, a full viewing activity log per profile with the ability to remove individual titles from history, and a sign out option with a second option to sign out of all devices simultaneously.

The subscription screen shows the current plan, the renewal date, and plan comparison cards. Upgrade and downgrade options are shown with clear pricing. The cancel subscription flow has a multi-step confirmation with retention messaging, exactly as Netflix does it. No real payment processing is implemented — these are UI-only flows.

---

## Performance and Quality Standards

Every screen must handle its loading state gracefully with shimmer skeletons. Every screen must have an empty state with an appropriate illustration and message for when there is no content to show. Every network request must be wrapped in error handling that shows a user-friendly error message and a retry option when something fails.

Images must lazy-load and use a low-quality blurred placeholder while the full image downloads. Infinite scroll or cursor-based pagination must be used on all grid browse pages so the user never hits a hard limit. On web, images use the Next.js Image component for optimization. On mobile, images cache aggressively for smooth scrolling.

All text-based interactive elements must have ARIA labels on web and content descriptions on Android for accessibility. Focus management on web must be logical and keyboard-navigable. TV navigation must never trap focus.

TypeScript strict mode is used throughout the web and mobile codebases. No `any` types without an explanatory comment. All asynchronous operations use proper async/await patterns with error boundaries. The Android TV codebase uses Kotlin coroutines and StateFlow throughout.

---

## Prohibited Patterns

Do not use mock or hardcoded content data anywhere. Every title, image, rating, and description must come from the TMDB API.

Do not implement a real video player. The stream itself is always an iframe. Build the full player shell and controls around it, but the video output is always mounted via an iframe whose source URL is provided externally.

Do not use Netflix's actual assets — no Netflix logo, no Netflix color if the user has specified their own, no proprietary imagery.

Do not skip any animation. Every hover state, every transition, every loading state, every scroll behavior described in this prompt must be implemented. The animations are not decoration. They are what makes the experience feel premium.

Do not implement a real payment processing backend. Subscription and billing screens are UI only.

Do not mix code or components between the three app folders under any circumstance.

---

## Build Order

Build the three applications in this sequence: first the complete web application from landing page through player, then the complete mobile application mirroring all web features adapted for touch interaction, then the complete Android TV application adapted for D-pad navigation and ten-foot viewing distance. Within each application, build in this order: authentication and profile system, home screen with hero and rows, card component with all states, detail view, player shell, search, browse and genre pages, watchlist and continue watching, settings and account pages, onboarding flow.

Confirm each major section compiles and functions correctly before moving to the next. Do not batch deliver everything at once.