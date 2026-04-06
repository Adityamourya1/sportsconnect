# Interest-Based Recommendation System

## Overview
The recommendation system provides personalized feed and league suggestions based on user-selected interests in their profile. Users can select sports interests (e.g., cricket, football, basketball) and the system will:

1. **Recommend posts** matching their interests
2. **Recommend leagues** for their selected sports
3. Display personalized content on their feed

## How It Works

### User Interests Setup
1. Navigate to **Edit Profile**
2. Add sports interests (cricket, football, basketball, etc.)
3. Save the profile

### Feed Recommendations
- **Location**: Home page feed
- **Algorithm**: 
  - Posts from followed users (priority)
  - Posts matching user interests (hashtags and captions)
  - Popular/trending posts
- **Display**: Shows a banner indicating "Personalized Feed Active" with selected interests

### League Recommendations
- **Location**: Leagues page
- **Algorithm**: Matches sports field with user interests
- **Display**: 
  - Recommended leagues section at the top
  - All leagues section below
  - "⭐ Recommended for You" banner shows matching leagues

## Backend Implementation

### Files Modified
1. **app/services/recommendation.py**
   - `recommend_posts_by_interests()`: Matches posts by hashtags/caption
   - `recommend_leagues_by_interests()`: Matches leagues by sport

2. **app/routes/feed.py**
   - Updated `get_personalized_feed()` endpoint
   - Integrates interest-based post recommendations
   - Fallback to popular posts if insufficient content

3. **app/routes/leagues.py**
   - New endpoint: `GET /api/leagues/{user_id}/recommended`
   - Returns leagues matched to user interests

### API Endpoints

#### Get Personalized Feed
```
GET /api/feed/{user_id}?skip=0&limit=20
```
- Returns posts from followed users + interest-matching posts

#### Get Recommended Leagues
```
GET /api/leagues/{user_id}/recommended?limit=10
```
- Returns leagues matching user interests
- Returns popular leagues if no interests set

## Frontend Implementation

### Files Modified
1. **src/services/api.js**
   - Added `getRecommendedLeagues()` method

2. **src/pages/HomePage.jsx**
   - Shows personalized feed banner
   - Displays user interests
   - Auto-fetches interest-based feed

3. **src/pages/LeaguesPage.jsx**
   - Recommended leagues section
   - All leagues section
   - Follow/unfollow toggle
   - Shows matching interests for recommendations

### Features

#### Home Page
- Personalized Feed banner showing active interests
- Mixed feed of:
  - Posts from followed users
  - Posts matching user interests
  - Trending posts

#### Leagues Page
- **Recommended Section** (if interests set)
  - Shows only leagues matching user sports
  - Highlighted with ⭐ icon
  - Shows user interests at top
- **All Leagues Section**
  - Shows all available leagues
  - Can follow/unfollow any league

## Example Scenarios

### Scenario 1: Cricket Interest
1. User sets "cricket" as interest in profile
2. Home feed shows cricket-related posts (hashtags: #cricket, #IPL, etc.)
3. Leagues page recommends: IPL, other cricket leagues
4. Feed updates in real-time as new cricket posts are added

### Scenario 2: Multiple Interests
1. User sets interests: ["cricket", "football"]
2. Home feed shows mix of cricket and football posts
3. Leagues page recommends cricket and football leagues
4. System prioritizes relevant content for both sports

### Scenario 3: No Interests Set
1. Feed shows posts from followed users only
2. Leagues page shows all available leagues
3. User prompted to set interests for personalization

## Technical Details

### Recommendation Algorithm
1. **Content Matching**
   - Checks post hashtags for interest keywords
   - Scans caption for interest mentions
   - Scoring: hashtag match = 3 points, caption mention = 1 point

2. **Engagement Boost**
   - Adds engagement score: (likes × 0.1) + (comments × 0.2)
   - Popular posts ranked higher

3. **League Matching**
   - Direct sport field match with interests
   - Returns all matching leagues

### Caching
- Feed is cached for better performance
- Cache invalidated when feed is refreshed
- Redis integration available

## Future Enhancements

1. **Collaborative Filtering**
   - Recommend based on similar users' interests

2. **ML-Based Ranking**
   - Machine learning model for better post ranking
   - User click-through rate analysis

3. **Seasonal Updates**
   - Adjust recommendations based on sports season

4. **Advanced Filters**
   - Filter by sport, league, players
   - Time-based filtering (today's highlights, etc.)

5. **Notifications**
   - Alert when new content for interests is posted
   - League updates and activities

## Testing

### Manual Testing
1. Create account and set interests
2. Verify home feed shows interest-based recommendations
3. Check Leagues page shows recommended leagues
4. Test with multiple interests
5. Remove interests and verify feed reverts to following-only

### Unit Tests (Recommended)
```python
# Test recommend_posts_by_interests()
# Test recommend_leagues_by_interests()
# Test with empty interests
# Test with invalid interests
```

## Performance Metrics

- Feed load time: < 2 seconds
- Recommendation calculation: < 500ms
- Cache hit ratio target: > 80%

## Troubleshooting

### Feed not showing recommendations
- Check user profile has interests set
- Verify posts have matching hashtags
- Check MongoDB connection

### Leagues not showing as recommended
- Ensure league has correct sport field
- Verify user interests match league sport
- Check API endpoint returns data

### Performance Issues
- Enable Redis caching
- Optimize MongoDB indexes on interests and sport fields
- Implement pagination for large result sets
