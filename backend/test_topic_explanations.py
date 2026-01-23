"""
Test script to verify topic explanations are working correctly.
Run this after applying the migration to test the new feature.
"""
import asyncio
import json
from app.ai_service import generate_roadmap

async def test_topic_explanations():
    """Test that AI generates topics with explanations"""
    
    print("🧪 Testing AI roadmap generation with topic explanations...\n")
    
    try:
        # Test goal
        goal_description = "I want to learn Python basics for web development"
        
        print(f"📝 Goal: {goal_description}\n")
        print("⏳ Generating roadmap with AI...\n")
        
        # Generate roadmap
        roadmap_data = await generate_roadmap(goal_description)
        
        print("✅ Roadmap generated successfully!\n")
        print(f"📊 Title: {roadmap_data['title']}")
        print(f"📁 Category: {roadmap_data['category']}")
        print(f"🎯 Difficulty: {roadmap_data['difficulty']}\n")
        
        # Check first level and topics
        if roadmap_data.get('roadmap') and roadmap_data['roadmap'].get('levels'):
            first_level = roadmap_data['roadmap']['levels'][0]
            print(f"📚 First Level: {first_level['title']}")
            print(f"📝 Description: {first_level['description']}\n")
            
            if first_level.get('topics'):
                print(f"🔍 Topics ({len(first_level['topics'])} total):\n")
                
                for i, topic in enumerate(first_level['topics'][:3], 1):  # Show first 3
                    print(f"  {i}. {topic['name']}")
                    if topic.get('explanation'):
                        print(f"     💡 {topic['explanation']}")
                    else:
                        print("     ⚠️  WARNING: No explanation generated!")
                    print()
                
                # Verify all topics have explanations
                missing_explanations = [
                    topic['name'] for topic in first_level['topics']
                    if not topic.get('explanation')
                ]
                
                if missing_explanations:
                    print(f"❌ ERROR: {len(missing_explanations)} topics missing explanations:")
                    for topic_name in missing_explanations:
                        print(f"   - {topic_name}")
                    return False
                else:
                    print(f"✅ All {len(first_level['topics'])} topics have explanations!")
                    return True
            else:
                print("❌ ERROR: No topics found in first level")
                return False
        else:
            print("❌ ERROR: No levels found in roadmap")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = asyncio.run(test_topic_explanations())
    
    if success:
        print("\n" + "="*60)
        print("✅ ALL TESTS PASSED! Topic explanations are working correctly.")
        print("="*60)
    else:
        print("\n" + "="*60)
        print("❌ TESTS FAILED! Please check the AI service configuration.")
        print("="*60)
