from typing import Optional, List
from app.config import settings
import openai
import logging

logger = logging.getLogger(__name__)

# Configure OpenAI
if settings.OPENAI_API_KEY:
    openai.api_key = settings.OPENAI_API_KEY

class AIService:
    """Service for AI-powered content generation and analysis"""
    
    @staticmethod
    async def generate_caption(sport: str, context: Optional[str] = None) -> str:
        """Generate caption using OpenAI API"""
        try:
            if not settings.OPENAI_API_KEY:
                logger.warning("OpenAI API not configured, returning mock caption")
                return "🏆 Amazing moment captured at the game! Check out this incredible play. #sports #motivation"
            
            prompt = f"""Generate a short, engaging sports caption for a {sport} post. 
            {f'Context: {context}' if context else ''}
            The caption should be:
            - Between 50-150 characters
            - Engaging and motivational
            - Include relevant emojis
            - Include 1-2 hashtags
            
            Just provide the caption, nothing else."""
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a sports social media content creator that generates engaging captions."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=150
            )
            
            caption = response.choices[0].message.content.strip()
            logger.info(f"✓ Caption generated: {caption[:50]}...")
            return caption
        
        except Exception as e:
            logger.error(f"Caption generation error: {e}")
            return "🏆 Amazing moment captured! #sports #motivation"
    
    @staticmethod
    async def generate_hashtags(caption: str, sport: Optional[str] = None) -> List[str]:
        """Generate hashtags based on caption and sport"""
        try:
            if not settings.OPENAI_API_KEY:
                logger.warning("OpenAI API not configured, returning mock hashtags")
                return ["sports", "sportsnet", "motivation", "passion", "athlete"]
            
            prompt = f"""Extract and generate relevant hashtags for this sports post:
            Caption: {caption}
            Sport: {sport or 'general'}
            
            Generate 5-8 relevant hashtags (without # symbol).
            Common hashtags: sports, motivation, passion, athlete, training, tournament, victory
            
            Return only the hashtags separated by commas, no other text."""
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a social media expert that generates relevant hashtags for sports posts."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,
                max_tokens=100
            )
            
            hashtags_str = response.choices[0].message.content.strip()
            hashtags = [tag.strip() for tag in hashtags_str.split(',')]
            logger.info(f"✓ Hashtags generated: {hashtags}")
            return hashtags[:8]
        
        except Exception as e:
            logger.error(f"Hashtag generation error: {e}")
            return ["sports", "SportsConnect", "motivation", "passion", "athlete"]
    
    @staticmethod
    async def generate_image(prompt: str, sport: Optional[str] = None) -> str:
        """Generate image using OpenAI DALL-E (if enabled)"""
        try:
            if not settings.OPENAI_API_KEY:
                logger.warning("OpenAI API not configured, returning placeholder image")
                return "https://via.placeholder.com/600x400?text=Generated+Sports+Image"
            
            # Note: DALL-E image generation requires additional API calls
            # For MVP, return placeholder
            logger.info("Image generation via DALL-E not yet enabled")
            return "https://via.placeholder.com/600x400?text=Sports+Image"
        
        except Exception as e:
            logger.error(f"Image generation error: {e}")
            return "https://via.placeholder.com/600x400?text=Error"
    
    @staticmethod
    async def analyze_sentiment(text: str) -> dict:
        """Analyze sentiment of text using OpenAI"""
        try:
            if not settings.OPENAI_API_KEY:
                logger.warning("OpenAI API not configured, using local sentiment analysis")
                return AIService._local_sentiment_analysis(text)
            
            prompt = f"""Analyze the sentiment of this text and provide:
            1. Sentiment (positive, negative, neutral)
            2. Score from -1 (most negative) to 1 (most positive)
            
            Text: {text}
            
            Format your response as JSON: {{"sentiment": "...", "score": ...}}"""
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a sentiment analysis expert. Respond with JSON only."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=100
            )
            
            # Parse JSON response
            import json
            result = json.loads(response.choices[0].message.content.strip())
            logger.info(f"✓ Sentiment analyzed: {result['sentiment']}")
            return result
        
        except Exception as e:
            logger.error(f"Sentiment analysis error: {e}")
            return AIService._local_sentiment_analysis(text)
    
    @staticmethod
    def _local_sentiment_analysis(text: str) -> dict:
        """Fallback local sentiment analysis"""
        positive_keywords = ["great", "love", "amazing", "awesome", "excellent", "brilliant", "wonderful", "fantastic"]
        negative_keywords = ["bad", "hate", "terrible", "awful", "poor", "horrible", "disgusting"]
        
        text_lower = text.lower()
        positive_count = sum(1 for word in positive_keywords if word in text_lower)
        negative_count = sum(1 for word in negative_keywords if word in text_lower)
        
        if positive_count > negative_count:
            sentiment = "positive"
            score = 0.5 + (positive_count * 0.1)
        elif negative_count > positive_count:
            sentiment = "negative"
            score = -0.5 - (negative_count * 0.1)
        else:
            sentiment = "neutral"
            score = 0.0
        
        return {
            "sentiment": sentiment,
            "score": min(max(score, -1.0), 1.0),
        }
