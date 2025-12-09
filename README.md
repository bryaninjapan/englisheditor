# Professional English Editor

A modern, clean web application for English text proofreading and polishing powered by AI.

## Features

- **Multi-Model Support**: Choose from multiple AI models including:
  - Gemini 3 Pro (Preview)
  - Gemini 2.5 Pro / Flash
  - Gemini 2.0 Flash (Experimental)
  - Gemini 1.5 Pro / Flash
  - GPT-4o / GPT-4o Mini

- **Dual Editing Modes**:
  - **General Editing**: For everyday text improvement
  - **Legal Professional**: Specialized for legal documents

- **Smart Features**:
  - Automatic history saving (last 20 records)
  - Copy to clipboard
  - Export to Markdown (.md)
  - Local storage for API keys
  - Beautiful markdown rendering with table support

- **Privacy First**: 
  - All API keys stored locally in your browser
  - No backend required
  - No data sent to third-party servers

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd englisheditor
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Configuration

1. Click the Settings (gear) icon in the header
2. Enter your API keys:
   - **Google Gemini API Key**: For Gemini models
   - **OpenAI API Key**: For GPT models
3. Keys are stored locally in your browser

## Usage

1. Select your preferred model from the dropdown
2. Choose editing mode (General or Legal)
3. Paste your English text in the input area
4. Click "Start Polishing"
5. Review the analysis and polished version
6. Copy or export the result

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Markdown**: react-markdown with remark-gfm
- **Language**: TypeScript

## Project Structure

```
englisheditor/
├── app/
│   ├── lib/
│   │   ├── prompts.ts      # Hidden system prompts
│   │   └── utils.ts        # Utility functions
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main application
├── public/                 # Static assets
└── package.json           # Dependencies
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
