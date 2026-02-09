# Colzen AI - Release Notes

## Version 1.0.0

**Release Date:** February 2026

---

## Introducing Colzen AI

We're excited to announce **Colzen AI**, a powerful new AI-powered color palette generator integrated directly into ProColors. Generate beautiful, harmonious color palettes simply by describing your brand, mood, or design requirements in natural language.

---

## Key Features

### AI-Powered Color Generation
- **Natural Language Input**: Simply describe what you need — "Create a modern tech startup palette" or "I need warm, cozy colors for a coffee shop brand"
- **Smart Color Extraction**: AI understands context and generates semantically meaningful color palettes
- **Multi-Model Reliability**: Powered by multiple free AI models with automatic fallback for consistent availability

### Intuitive Chat Interface
- **Conversational Experience**: Chat naturally with AI to refine and iterate on your color palettes
- **Real-time Responses**: Watch as AI generates palettes based on your descriptions
- **Message History**: All conversations are automatically saved to your local storage

### Dynamic Welcome Experience
- **Personalized Greetings**: 4 rotating welcome messages to keep the experience fresh
- **Quick Action Cards**: One-click access to popular features:
  - Generate Shades
  - Explore Palettes
  - Mesh Gradients
  - Step-by-step Help

### Attachment Options
Click the **+** button to enhance your prompts with:
- **Color Picker**: Select specific colors to include in your palette
- **Upload Image**: Extract colors from any image for AI to work with
- **Import Colors**: Load colors from CSV or JSON files

### Seamless Workflow Integration
Once AI generates a palette, use the **Actions** dropdown to:
- **Generate Shades**: Create full shade scales from the palette
- **Generate Tokens**: Convert colors to design tokens
- **Create Figma Variables**: Instantly add colors as Figma variables
- **Create Figma Styles**: Generate Figma color styles
- **Show Themes**: Explore theme variations
- **Create Mesh Gradient**: Generate beautiful mesh gradients
- **Export Colors**: Export in various formats

### Chat History Management
- **Persistent Storage**: All chats saved locally for future reference
- **History Panel**: Side panel view for easy access to past conversations
- **Quick Resume**: Load any previous chat and continue where you left off
- **Easy Cleanup**: Delete chats you no longer need

---

## User Interface Highlights

### Beautiful Animations
- Smooth fade-in animations on the welcome screen
- Slide-in effects for chat messages
- Elegant transitions throughout the interface

### Prominent Sidebar Access
- Dedicated AI button at the bottom of the sidebar
- Animated gradient border for easy discoverability
- Quick access from anywhere in the plugin

### Clean Header Design
- Module icon matching sidebar navigation
- **New** button to start fresh conversations
- **History** button to access past chats

---

## Technical Details

### AI Infrastructure
- Utilizes OpenRouter API with multiple free AI models
- Secure API key handling via Vercel Edge Runtime proxy
- 15-second timeout per model with automatic fallback
- Optimized for fast response times

### Supported AI Models (Fallback Order)
1. GPT-3.5 Turbo
2. Mixtral 8x7B Instruct
3. Mistral 7B Instruct
4. Llama 2 70B Chat
5. OpenHermes 2.5
6. Zephyr 7B Beta
7. StableLM Zephyr 3B

### Data Privacy
- Chat history stored locally in browser storage
- No conversation data sent to external servers (except AI processing)
- Users maintain full control over their data

---

## Getting Started

1. Click the **Colzen AI** button in the sidebar (bottom)
2. Type your color palette request in natural language
3. Review the generated palette
4. Use **Actions** to apply colors to your workflow
5. Access previous chats via the **History** button

---

## Tips for Best Results

- **Be Specific**: "Modern SaaS dashboard with blue primary and green accents" works better than just "blue colors"
- **Describe the Mood**: Include emotional context like "calming", "energetic", or "professional"
- **Mention Industry**: Specify your industry for more contextual palettes
- **Iterate**: Ask AI to adjust palettes — "Make it more vibrant" or "Add a warmer accent"

---

## Known Limitations

- AI response times may vary based on model availability
- Maximum of 50 chat sessions stored in history
- Image color extraction limited to 6 dominant colors

---

## Feedback

We'd love to hear your thoughts on Colzen AI! Your feedback helps us improve the experience for everyone.

---

*Built with ❤️ for designers who love color*
