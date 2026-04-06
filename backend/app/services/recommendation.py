from typing import List, Optional, Dict, Any
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd

class RecommendationEngine:
    """Content-based recommendation system with interest-based filtering"""
    
    def __init__(self):
        self.user_posts = {}
        self.post_features = {}
        self.user_interests = {}
    
    async def recommend_posts_by_interests(
        self,
        user_id: str,
        user_interests: List[str],
        all_posts: List[dict],
        top_n: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Recommend posts that match user interests
        Matches user interests with post hashtags and caption
        """
        try:
            if not all_posts or not user_interests:
                return []
            
            scored_posts = []
            interests_lower = [interest.lower() for interest in user_interests]
            
            for post in all_posts:
                score = 0
                post_id = str(post.get("_id", ""))
                
                # Check hashtags match
                hashtags = [tag.lower() for tag in post.get("hashtags", [])]
                for interest in interests_lower:
                    if interest in hashtags:
                        score += 3  # High weight for direct hashtag match
                
                # Check caption for interest keywords
                caption = post.get("caption", "").lower()
                for interest in interests_lower:
                    if interest in caption:
                        score += 1  # Lower weight for caption mention
                
                # Add engagement boost
                likes_count = len(post.get("likes", []))
                comments_count = len(post.get("comments", []))
                score += (likes_count * 0.1) + (comments_count * 0.2)
                
                if score > 0:
                    scored_posts.append({
                        "post_id": post_id,
                        "score": score,
                        "post": post
                    })
            
            # Sort by score and return top N
            sorted_posts = sorted(scored_posts, key=lambda x: x["score"], reverse=True)
            return sorted_posts[:top_n]
        
        except Exception as e:
            print(f"Interest-based recommendation error: {e}")
            return []
    
    async def recommend_leagues_by_interests(
        self,
        user_interests: List[str],
        all_leagues: List[dict],
        top_n: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Recommend leagues that match user interests (by sport)
        """
        try:
            if not all_leagues or not user_interests:
                return []
            
            interests_lower = [interest.lower() for interest in user_interests]
            matching_leagues = []
            
            for league in all_leagues:
                league_sport = league.get("sport", "").lower()
                
                # Direct sport match
                if league_sport in interests_lower:
                    matching_leagues.append({
                        "league": league,
                        "score": 10,  # High priority for direct match
                        "league_id": str(league.get("_id", ""))
                    })
            
            # Sort by score and return top N
            sorted_leagues = sorted(matching_leagues, key=lambda x: x["score"], reverse=True)
            return sorted_leagues[:top_n]
        
        except Exception as e:
            print(f"League recommendation error: {e}")
            return []
    
    async def recommend_posts(
        self, 
        user_id: str, 
        user_interests: List[str], 
        all_posts: List[dict],
        top_n: int = 10
    ) -> List[str]:
        """
        Recommend posts based on user interests and engagement
        Uses content-based filtering
        """
        try:
            if not all_posts:
                return []
            
            # Extract relevant features from posts
            posts_data = []
            post_ids = []
            
            for post in all_posts:
                post_ids.append(str(post.get("_id", "")))
                
                # Combine caption and hashtags for content analysis
                content = f"{post.get('caption', '')} {' '.join(post.get('hashtags', []))}"
                posts_data.append(content)
            
            # If no content, return empty
            if not posts_data:
                return []
            
            # Vectorize post content using TF-IDF
            vectorizer = TfidfVectorizer(max_features=100, stop_words='english')
            post_vectors = vectorizer.fit_transform(posts_data).toarray()
            
            # Create user interest vector
            user_interest_text = " ".join(user_interests)
            user_vector = vectorizer.transform([user_interest_text]).toarray()
            
            # Calculate similarity scores
            similarity_scores = cosine_similarity(user_vector, post_vectors)[0]
            
            # Add engagement-based scoring
            engagement_scores = np.array([
                len(post.get("likes", [])) * 0.5 +  # Likes
                len(post.get("comments", [])) * 1.0  # Comments (higher weight)
                for post in all_posts
            ])
            
            # Normalize and combine scores
            normalized_engagement = engagement_scores / (np.max(engagement_scores) + 1e-8)
            final_scores = 0.7 * similarity_scores + 0.3 * normalized_engagement
            
            # Get top N recommendations
            top_indices = np.argsort(final_scores)[-top_n:][::-1]
            recommended_ids = [post_ids[idx] for idx in top_indices if final_scores[idx] > 0]
            
            return recommended_ids
        
        except Exception as e:
            print(f"Recommendation error: {e}")
            return []
    
    async def get_trending_posts(
        self, 
        all_posts: List[dict],
        top_n: int = 10
    ) -> List[str]:
        """Get trending posts based on engagement"""
        try:
            if not all_posts:
                return []
            
            # Calculate engagement score for each post
            scoring_data = []
            for post in all_posts:
                likes_count = len(post.get("likes", []))
                comments_count = len(post.get("comments", []))
                shares_count = post.get("shares", 0)
                
                # Weighted engagement score
                engagement_score = (
                    likes_count * 1 +
                    comments_count * 2 +
                    shares_count * 3
                )
                
                scoring_data.append({
                    "post_id": str(post.get("_id", "")),
                    "score": engagement_score,
                    "created_at": post.get("created_at")
                })
            
            # Sort by engagement score
            sorted_posts = sorted(scoring_data, key=lambda x: x["score"], reverse=True)
            
            # Return top N post IDs
            return [p["post_id"] for p in sorted_posts[:top_n]]
        
        except Exception as e:
            print(f"Trending posts error: {e}")
            return []
