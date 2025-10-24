![Scary Adventures](src/client/public/assets/title.png)

<video width="100%" controls autoplay muted loop>
  <source src="https://dkmrgxmlsmcmnvsntspm.supabase.co/storage/v1/object/public/demos/scaryadventures-demo.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

**Scary Adventures** is an interactive story game that runs directly within Reddit posts. Players navigate through AI-generated branching storylines where every choice determines their fate. Each playthrough offers a different experience with multiple possible endings across various scary categories.

The game features atmospheric visuals, community ratings, personal statistics tracking, and a history system that avoids repeating stories. Each story includes custom AI-generated artwork that adapts to the narrative's mood and style.

### **AI-Powered Storytelling**
- **AI-Generated Content**: All stories, dialogue, and artwork are created using AI models (Gemini, xAI Grok)
- **Dynamic Narratives**: Each story features unique branching paths with 2-3 choices per scene leading to multiple endings
- **Atmospheric Artwork**: Every scene includes custom AI-generated illustrations with specific art styles (oil painting, charcoal sketch, pixel art, photo realism, comic noir)
- **Personalized Experience**: Each playthrough is unique, with a different story and artwork each time

### **Reddit-Native Gaming**
- **No Downloads Required**: Runs directly within Reddit posts using React and modern web technology
- **Seamless Integration**: Full-screen gaming experience within the Reddit ecosystem using Devvit platform
- **Cross-Platform**: Optimized for desktop, mobile, and tablet devices with responsive design and Reddit breakpoints

### **Advanced Community Features**
- **Story Leaderboards**: See which stories are most popular with the community, ranked by Wilson score algorithm for accurate ratings
- **Rating System**: Rate stories with thumbs up/down system and help others discover the best adventures
- **Story Statistics**: View completion rates, average play times, total players, and community ratings for each individual story
- **Community Analytics**: Moderators can view comprehensive analytics including total games started/completed, popular categories, and duration preferences

### **Personalization Features**
- **History Tracking**: Never replay the same story unless you reset your history - powered by Redis persistence
- **Category Filtering**: Choose from multiple scary categories including Gothic, Cosmic, Psychological, Body Scary, Slasher, Folk, Supernatural, Occult, Surreal, and Noir Scary
- **Duration Selection**: Pick short (5-10 min), medium (15-20 min), or long (25-30 min) adventures based on actual story content
- **Preference Analytics**: Track your favorite categories and duration preferences over time

### **Comprehensive Personal Analytics**
- **Detailed Statistics**: Track completions, abandonment rates, completion streaks, favorite categories, and actual play times measured in real-time
- **Achievement System**: Unlock fun facts and achievements based on your play patterns
- **Recent Activity**: Review your last adventures with ratings, completion status, and time spent on each story
- **Records Tracking**: See your longest and shortest adventures by actual play time, best completion streaks, and average ratings given

## How to Play

### **Getting Started**

1. **Find the Game**: Look for "Scary Adventures" posts in participating subreddits
2. **Launch**: Click the "Play" button on the splash screen to open the full-screen game
3. **Choose Your Path**: Select "Begin Adventure" for a random story, or "Customize" to pick specific preferences

### **Customizing Your Experience**

The main menu features a video background with atmospheric fog effects and typography using Cinzel Decorative and Crimson Pro fonts.

1. **Select Category**: Choose from multiple scary categories:
   - **Gothic**: Dark castles, ancient curses, and supernatural dread
   - **Slasher**: Relentless pursuit, sharp edges, and mortal terror  
   - **Psychological**: Mind games, reality bends, and inner demons
   - **Cosmic**: Vast unknowns, eldritch entities, and cosmic insignificance
   - **Folk**: Pastoral tales that twist into unease and wrongness
   - **Supernatural**: Classic ghost stories balancing sorrow and menace
   - **Occult**: Ritualistic mysteries with symbols and ancient knowledge
   - **Body Scary**: Grotesque transformations between human and inhuman
   - **Surreal**: Fragmented reality where walls breathe and logic fails
   - **Noir Scary**: Gritty urban decay with cynical inner monologue
   - **Random**: Let fate choose your experience

2. **Choose Duration**:
   - **Short**: 5-10 minutes
   - **Medium**: 10-15 minutes  
   - **Long**: 15-20 minutes
   - **Random**: Surprise me with the length

3. **Start Adventure**: The game randomly selects a story matching your chosen filters that you haven't played before


### **Tracking Your Progress**

Access comprehensive analytics through the "My Stats" button:

- **Adventure Overview**: 
  - Total completed, started, and completion rate
  - Current completion streak and longest streak achieved
  - Average rating you give to stories

- **Records & Achievements**:
  - Longest and shortest adventures by actual play time
  - Favorite scary categories based on play history
  - Fun facts based on your play patterns

- **Recent Activity**: 
  - Last adventures with completion status, ratings, and time spent
  - Quick access to replay or rate previous stories

- **Preferences Analysis**:
  - Category breakdown showing your play history
  - Duration preferences based on play history
  - Statistics on your favorite story types

### **Community Features**

- **Top Rated Leaderboard**: Browse the highest-rated stories using Wilson score algorithm
  - Filter by scary category to find the best stories in your preferred genre
  - See community ratings, completion rates, and play counts
  - Play stories directly from the leaderboard

- **Story Statistics**: Each story displays:
  - Total adventurers who have played
  - Completion vs abandonment rates  
  - Average play time and total community time invested
  - Like/dislike ratios and total ratings

- **History System**: 
  - Never replay the same story unless you choose to reset your history
  - Random selection from unplayed stories matching your chosen filters
  - Option to completely reset all statistics and start fresh

### **Visual Experience**

- **AI-Generated Artwork**: Each scene features custom illustrations with:
  - **Art Styles**: Oil painting, charcoal sketch, pixel art, photo realism, comic noir
  - **Lighting Moods**: Moonlight, candlelight, dim ambient, harsh fluorescent, flickering fire
  - **Color Palettes**: Monochrome, muted reds/greens, desaturated pastels
  - **Camera Perspectives**: First-person, wide cinematic, low angle, bird's eye view

- **Atmospheric Design**: 
  - Gothic typography with Cinzel Decorative headers and Crimson Pro body text
  - Scary-themed color scheme with blood reds, bone whites, and shadow blacks
  - Smooth scene transitions with fade effects and loading animations
  - Atmospheric fog effects and vignette overlays

- **Responsive Layout**: 
  - Mobile-first design optimized for Reddit's breakpoints (375px, 376-724px, 725px+)
  - Scene images adapt to different screen sizes with appropriate aspect ratios
  - Touch-friendly interface with large, accessible buttons


## Technical Architecture

### **Platform & Framework**
- **Devvit Platform**: Built on Reddit's developer platform for native Reddit integration
- **React 19.1.0**: Modern React with hooks for state management and component architecture
- **TypeScript**: Full type safety across client, server, and shared code
- **Vite**: Fast build tool for both client and server bundles with hot reloading
- **Express**: Server-side API framework handling all backend operations

### **Data & Persistence**
- **Redis**: All user data, ratings, analytics, and story metadata stored in Redis
- **Serverless Architecture**: Built on Devvit's serverless platform for automatic scaling
- **Story Caching**: Intelligent story caching system for fast loading and filtering
- **User Sessions**: Persistent user data across sessions with automatic Reddit authentication

### **Frontend Features**
- **Responsive Design**: Mobile-first design optimized for Reddit's breakpoints (375px, 376-724px, 725px+)
- **Image Preloading**: Smooth scene transitions with intelligent image preloading
- **Atmospheric UI**: Custom CSS with scary-themed design, fog effects, and smooth animations
- **Performance Optimized**: Efficient asset management, lazy loading, and optimized rendering

### **Backend Architecture**
- **RESTful API**: Clean API endpoints for stories, ratings, analytics, and user management
- **Wilson Score Algorithm**: Accurate story ranking using statistical confidence intervals
- **Smart Filtering**: Story filtering system that avoids repeats and respects user preferences
- **Analytics Engine**: Comprehensive tracking of user behavior and story performance

### **Story Management System**
- **AI-Generated Content**: Stories generated using Gemini and xAI Grok models
- **Dynamic Story Loading**: Stories embedded in server bundle for serverless compatibility
- **Metadata Indexing**: Fast story filtering by tone, duration, and user history
- **Asset Management**: Organized story assets with automatic path resolution

### **Security & Authentication**
- **Reddit Authentication**: Automatic user authentication through Devvit platform
- **Data Privacy**: User data isolated per Reddit user ID with secure Redis storage
- **Content Safety**: All AI-generated content reviewed and curated for appropriate scary themes
- **Rate Limiting**: Built-in protection against abuse through Devvit's infrastructure

## Development & Testing

### **Development Setup**

```bash
# Install dependencies
npm install

# Start development server (runs client, server, and Devvit in parallel)
npm run dev

# Build for production
npm run build

# Deploy to Reddit
npm run deploy

# Publish for community review
npm run launch
```

### **Testing Environment**

- **Local Development**: Use `npm run dev` to test with hot reloading
- **Devvit Playtest**: Automatic test subreddit creation for Reddit integration testing
- **Cross-Platform Testing**: Responsive design tested across mobile, tablet, and desktop
- **Story Management**: Tools for validating story format and managing content

### **Project Structure**

```
src/
├── client/          # React frontend (runs in Reddit webview)
│   ├── components/  # UI components (MainMenu, GameView, Leaderboard, etc.)
│   ├── hooks/       # React hooks (useGame, useCounter)
│   ├── public/      # Static assets (stories, images, fonts)
│   └── index.css    # Scary-themed styling with responsive design
├── server/          # Express backend (serverless API)
│   ├── api/         # API endpoints (/api/stories, /api/ratings, etc.)
│   └── core/        # Business logic (post creation, Reddit integration)
├── shared/          # Shared TypeScript types
└── tools/           # Development utilities (story management, indexing)
```

### **Story Content System**

- **Story Format**: JSON files with scenes, choices, and metadata
- **Asset Organization**: Organized by story with automatic path resolution
- **Content Generation**: AI-generated using Gemini and xAI Grok models
- **Quality Control**: All content reviewed for appropriate scary themes and technical quality

---

*All content in Scary Adventures is generated using artificial intelligence. Stories, artwork, and narrative elements are created by AI systems to provide unique, original experiences. The game includes a transparent AI content indicator and full disclosure of AI-generated content.*