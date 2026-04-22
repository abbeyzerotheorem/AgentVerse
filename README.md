# AgentVerse 🚀

An intelligent AI agent interface powered by Google's Gemini API. Chat, plan, and collaborate with AI—all in one streamlined application.

**AgentVerse** combines a conversational AI chat interface with goal-based planning capabilities. Built with Next.js and Google's Generative AI, it's designed to be lightweight, responsive, and easy to extend.

## Quick Start

Get up and running in seconds:

```bash
# Install dependencies
npm install

# Set up your environment
# Create a .env.local file with your Google API key:
# GOOGLE_API_KEY=your_api_key_here

# Start the development server
npm run dev
```

Your AgentVerse application will be running at `http://localhost:9002`.

## What's Next? Explore Your Agent's Universe

You've successfully launched AgentVerse. Now the fun begins. Here’s a roadmap to get you acquainted with your new AI-powered creation:

1.  **Start a Conversation:** Open your browser and start a new chat. Get a feel for the default agent's personality.
2.  **Generate Code:** Ask your agent to create a UI component. For example: *"Create a login form with a password visibility toggle."* Then, open the generated code in the **Sandbox** to see it come to life instantly.
3.  **Customize Your Agent:** Navigate to the **Settings** page. This is where you take control. Give your agent a new name, a unique role (like "Sarcastic Code Reviewer"), and custom instructions. Go back to the chat and see how its personality has transformed.
4.  **Dive into the Code:**
    *   `src/app/chat/[conversationId]/page.tsx`: This is the heart of the chat interface. See how it handles user and assistant messages.
    *   `src/ai/flows/chat.ts`: Explore the Genkit flow that powers the agent's decision-making and responses.
    *   `src/components/ui/`: Check out the beautiful, reusable ShadCN components that make up the UI.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **AI Engine:** [Google Generative AI (Gemini)](https://ai.google.dev/)
- **UI Components:** [Radix UI](https://www.radix-ui.com/) + [ShadCN UI](https://ui.shadcn.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/guide/packages/lucide-react)
- **State Management:** React hooks + localStorage for persistence
- **Language:** TypeScript

## Environment Setup

Create a `.env.local` file in the root directory:

```env
GOOGLE_API_KEY=your_google_api_key_here
```

Get your API key from [Google AI Studio](https://aistudio.google.com/)

## Development

```bash
# Run development server
npm run dev

# Type check
npm run typecheck

# Build for production
npm build

# Start production server
npm start
```

## Contributing

Contributions are welcome! Feel free to fork this repository and submit pull requests.

## License

MIT

---

*Built with ❤️ by Abiodun (Abbey) Aina*

