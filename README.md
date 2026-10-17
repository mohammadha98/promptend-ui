# Prompt-End — Front-end

> Conversation-management tooling for LLM chat: branching, snapshots, rebuild, navigate mode and message-level tooling, delivered as a modern Angular web application.

[![Angular](https://img.shields.io/badge/Angular-19-DD0031?logo=angular&logoColor=white)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![LangChain](https://img.shields.io/badge/LangChain-0.3-1C3D5A)](https://js.langchain.com)

## Overview

Prompt-End gives you back control over long AI conversations. Instead of losing context inside a single endless thread, you can branch a conversation from any point, rebuild it from a rewritten prompt, collapse the noise, attach AI explanations to a specific sentence and keep side discussions in dedicated horizontal threads.

This repository contains the **Angular front-end**: a marketing landing page plus the complete chat workspace (the application the browser extension will eventually wrap).

Everything runs in the browser and persists locally, so the app is usable without a backend: conversations, branches and user prompts are stored in `localStorage`, while the LLM calls go through LangChain to an OpenAI-compatible provider.

## Feature highlights

### Conversation management

- **Conversation branching** — create a new branch from the active branch of any session, switch between branches, and see every branch of a session with its own colour and relative timestamp.
- **Session history sidebar** — all sessions are listed with branch counts, activity status and "time ago" labels; new conversations can be created with one click.
- **Persistence** — sessions, branches, prompts and the theme survive a full page reload (`localStorage`), including graceful handling of storage-quota errors.

### Message tooling

- **Collapse & expand messages** — every message has its own collapse toggle with a preview line, plus a **Collapse All / Expand All** control for the whole conversation that toggles in both directions.
- **Inline editing with word-level diff** — clicking a message opens an editor; after saving, only the changed words are highlighted inside the message body.
- **AI explanations for selected text** — select a fragment, open the context menu and ask for an explanation; the explanation is rendered as a collapsible block while the original text stays highlighted.
- **Rebuild from a single message** — a modal lets you rewrite the prompt of a message and regenerate the conversation from that point.
- **Rebuild thread (batch)** — the right sidebar replays every stored user prompt of the conversation sequentially with `preserveIntent` and `aggressiveness` (`conservative` / `balanced` / `aggressive`) options, showing a live progress bar, the processed-message counter and a cancel action.
- **Per-message actions** — comment (opens a horizontal thread), copy, regenerate and rebuild.

### Navigation & reading modes

- **Navigate mode** — a header toggle that switches the workspace into a review-oriented, collapsed-by-default reading mode with message previews.
- **Horizontal threads** — side discussions attached to any message, rendered next to the main vertical chain. Messages form a tree (`vertical` / `horizontal` branch types with `depth` and `order`), support nested replies up to a configurable depth and expand/collapse per thread.

### UX, layout & theming

- **Dark / light theme** — class-based dark mode driven by Tailwind, initialised from `localStorage` or the OS preference and applied *before* bootstrap to avoid a flash of the wrong theme.
- **Fully responsive workspace** — both sidebars are static columns from `1024px` up; below that breakpoint they become overlay drawers with a shared backdrop, mutual exclusion and automatic closing on resize.
- **Design system** — Tailwind design tokens (`neutral`, `primary` teal, `secondary` indigo, `success`, `warning`, `danger`) plus reusable utility classes (`btn-primary`, `btn-secondary`, `card`, `input-field`, `special-button`) and a small icon component.
- **Accessibility** — `aria-label` / `aria-expanded` on toggles, keyboard support (`Esc` closes menus, `Ctrl/Cmd + Enter` sends a prompt) and visible focus rings.
- **Landing page** — a lazy-loaded marketing route with hero, features, benefits, CTA, testimonials and FAQ sections.

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | Angular 19 (standalone components, signals, new control flow, lazy routes) |
| Language | TypeScript 5.6 |
| UI | Tailwind CSS 3.4 + SCSS, custom design tokens, dark mode via `class` |
| Async | RxJS 7.8 (`Observable`s returned by every service call) |
| LLM | LangChain (`langchain`, `@langchain/openai`) with `ChatOpenAI` + `BufferMemory` / `ConversationChain` |
| Provider | AvalAI (OpenAI-compatible) — configurable base URL, API key and model |
| Realtime | Socket.IO client (`ngx-socket-io`) provider, wired in `app.config.ts` |
| Testing | Karma + Jasmine (`ng test`) |
| Tooling | Angular CLI 19, PostCSS/Autoprefixer, Vercel project configuration |

## Getting started

### Prerequisites

- **Node.js** 18.19.1+, 20.11.1+ or 22+ (Angular 19 requirement)
- **npm** 10+

### Install and run

```bash
npm install
npm start
```

The dev server runs on [http://localhost:4200](http://localhost:4200) and reloads automatically on every source change. The chat workspace lives at `/chat`.

### Available scripts

| Command | Description |
| --- | --- |
| `npm start` | `ng serve` — development server with the `development` configuration |
| `npm run build` | `ng build` — production build into `dist/promptend` |
| `npm run watch` | `ng build --watch --configuration development` — continuous development build |
| `npm test` | `ng test` — unit tests with Karma + Jasmine |

## Environment configuration

Angular environment files live in `src/environments`:

| File | Purpose |
| --- | --- |
| `environment.ts` | Production values (currently an empty object) |
| `environment.development.ts` | Development values: `SERVER_URL`, provider base URL, API key and model |

`angular.json` maps `environment.ts` to `environment.development.ts` for the **development** configuration, so `npm start` picks up the development values.

```ts
export const environment = {
  SERVER_URL: 'http://localhost:3000',

  // AvalAI (OpenAI-compatible) provider configuration
  AVALAI_BASE_URL: 'https://api.avalai.ir/v1',
  AVALAI_API_KEY: 'aa-...',
  AVALAI_MODEL: 'gpt-4o-mini',
};
```

> ⚠️ **Security notice.** Provider keys are currently committed in plain text inside `src/environments/environment.development.ts`, and the repository history already contains one. Before deploying or sharing this repository:
>
> 1. **Rotate** any key that has ever been committed.
> 2. Move real keys into a local, git-ignored file (or into a backend proxy) and keep only placeholders in the tracked file.
> 3. Prefer serving LLM traffic through the backend (`SERVER_URL`) instead of shipping a key to the browser.
>
> Also note that `AIChatService` imports `environment.development.ts` directly, so its shape must stay valid for production builds too.

## Project structure

```
src/
├── app/
│   ├── app.component.ts            # Root component (router outlet + theme init)
│   ├── app.config.ts               # Providers: router, HTTP, animations, Socket.IO
│   ├── app.routes.ts               # Lazy routes: '/' (landing), '/chat' (workspace)
│   ├── core/services/
│   │   └── theme.service.ts        # Dark/light theme state, persistence, DOM class
│   ├── shared/
│   │   ├── services/
│   │   │   ├── dialog.service.ts   # Imperative dialog host (createComponent + backdrop)
│   │   │   └── diff.service.ts     # Word-level LCS diff for edited messages
│   │   ├── sidebar/                # Generic sidebar component
│   │   └── ui/icon/                # Small inline icon component
│   └── modules/
│       ├── chat/
│       │   ├── components/
│       │   │   ├── chat/           # Workspace shell, drawers, rebuild orchestration
│       │   │   ├── chat-header/    # Session title, actions, navigate mode, theme
│       │   │   ├── chat-input/     # Composer
│       │   │   ├── chat-lists/     # Session/branch history list
│       │   │   ├── chat-sidebar/   # AI model + rebuild options panel
│       │   │   ├── horizontal-thread/ # Side-discussion panel
│       │   │   ├── message/        # Message rendering, editing, diff, explanations
│       │   │   ├── message-list/   # Message loop + Collapse/Expand All control
│       │   │   └── rebuild-modal/  # Single-message rebuild dialog
│       │   ├── models/             # MessageModel, ChatSession/Branch, EnhancedMessageModel
│       │   ├── pipes/              # highlightSpans pipe (explanation highlights)
│       │   └── services/           # AI, branching, rebuild, user messages, navigate mode…
│       └── landing/                # Marketing page (hero, features, FAQ, footer…)
├── environments/                   # Angular environment files
├── styles.scss                     # Tailwind layers, design tokens, utility classes
└── main.ts                         # Bootstrap + pre-bootstrap theme initialisation
```

## Routes

| Path | Component | Loading |
| --- | --- | --- |
| `/` | `LandingComponent` (via `LandingModule`) | lazy `loadChildren` |
| `/chat` | `ChatComponent` | lazy `loadComponent` |
| `**` | — | redirect to `/` |

## Architecture & state management

The app is fully signal-based: services own `WritableSignal` state and expose read-only signals (`asReadonly()`) or `computed()` views, while components read them directly in templates. Service calls that involve I/O return RxJS `Observable`s.

| Service | Responsibility |
| --- | --- |
| `AIChatService` | LangChain `ChatOpenAI` client aimed at the AvalAI (OpenAI-compatible) endpoint; one `ConversationChain` + `BufferMemory` per conversation; `addConversation`, `sendMessage`, `getMessages`, `setModel`, `deleteConversation`, `createBranch`, `rebuildConversationFrom`, `explainText`; chat history signal persisted under `ai_chat_history`. |
| `ChatBranchingService` | Session and branch CRUD (`createChatSession`, `createBranch`, `switchToBranch`, `updateBranchMessages`), persistence under `chatSessions`, and a typed error signal (`storage` / `validation` / `not_found`). |
| `UserMessagesService` | Stores every user prompt per conversation under `userMessages`, exposes rebuild progress, and provides import/export helpers. |
| `RebuildService` | Sequentially replays stored prompts through the AI, tracks progress, supports cancel / retry-from-index and reports statistics (estimated tokens and duration). |
| `NavigateModeService` | Global navigate-mode flag, per-message collapse bookkeeping and preview-text generation. |
| `HorizontalThreadService` | Message tree for side discussions (`vertical` / `horizontal`, `depth`, `order`), thread metadata, expand/collapse state and a demo-conversation generator. |
| `ThemeService` | `BehaviorSubject` based theme state, persistence and `dark` class toggling on `<html>`. |
| `DialogService` | Creates dialog components on demand, attaches them to the application, manages the backdrop and exposes `afterClosed()`. |
| `DiffService` | Word-level diff (longest common subsequence) used to highlight edited text. |

### Main flows

1. **Send a prompt** — `ChatInputComponent` emits the text → `ChatComponent` appends the user message, adds it to the current branch and to `UserMessagesService`, creates a conversation if needed (`AIChatService.addConversation`) and then calls `AIChatService.sendMessage`, appending the AI reply to both the UI and the active branch.
2. **Branch** — `ChatBranchingService.createBranch` clones the active branch messages (new IDs, same order) into a new branch, marks it active and records it in the session list.
3. **Rebuild** — `RebuildService.rebuildConversation` reads the stored prompts, creates a fresh conversation, replays the prompts one by one while updating progress, and finally hands the rebuilt messages back to the UI.
4. **Collapse / expand** — collapse state is kept in a `signal<Map<messageId, boolean>>` inside `MessageListComponent` and pushed down to `app-message` through the `isCollapsed` input; the "Collapse All" button collapses every rendered message and flips to "Expand All" once all of them are collapsed.
5. **Explain** — selecting text in a message opens the context menu → `AIChatService.explainText` returns an explanation → it is stored on the message as an `ExplainBlock` and the `highlightSpans` pipe wraps the source range in a `<mark>`.

## Data persisted in the browser

| `localStorage` key | Written by | Contents |
| --- | --- | --- |
| `chatSessions` | `ChatBranchingService` | Sessions with their branches and branch messages |
| `userMessages` | `UserMessagesService` | Every user prompt with conversation id and order |
| `ai_chat_history` | `AIChatService` | Conversation history list (titles, branch counters, status) |
| `theme` | `ThemeService` | `dark` or `light` |

## Data models

- `MessageModel` — `messageType` (`user` / `ai`), `content`, `userTokens`, `model`, editing state (`isEditing`, `editedText`), `diffSpans`, `explanations`, `isCollapsed`.
- `ChatSession` / `Branch` / `BranchMessage` — session → branches → ordered messages, with `isActive` and `parentBranchId` for hierarchy.
- `EnhancedMessageModel` — `MessageModel` plus tree metadata: `parentId`, `branchType` (`vertical` / `horizontal`), `children`, `order`, `depth`, `isHorizontalThreadCollapsed`, `horizontalThreadTitle`.
- `ExplainBlock` — highlighted range (`startOffset` / `endOffset`), the prompt text, the generated content and its UI state.

## Testing

```bash
npm test
```

Unit tests use Karma + Jasmine; specs live next to their components (`*.spec.ts`) for the app shell, chat workspace, header, composer, session list and the shared sidebar. Add specs alongside new components and services to keep coverage growing.

## Build & deployment

```bash
npm run build          # production bundle in dist/promptend
```

- Production builds use `environment.ts` (no file replacement) with output hashing and bundle budgets (500 kB warning / 1 MB error for initial bundles, 4 kB / 8 kB for component styles).
- The repository ships a Vercel project link (`.vercel/project.json`), so the `dist/promptend` output can be deployed directly from Vercel.

## Known limitations & roadmap

- **Client-side provider key** — LLM requests are issued from the browser with a bundled key; production usage should be proxied through the backend at `SERVER_URL`.
- **Committed credentials** — see the security notice above; keys must be rotated and moved out of the tracked environment file.
- **Demo data** — `ChatComponent.initializeMockData()` seeds a sample conversation with horizontal threads, and `HorizontalThreadComponent.generateAIResponse()` returns canned replies instead of calling the model.
- **Model picker** — the AI-model section in the right sidebar is presentational; `AIChatService.setModel()` exists but is not yet bound to the radio group.
- **Socket.IO** — the client provider is configured but no realtime events are consumed yet.
- **Navigate mode** — it updates collapse state on the branch messages only, while the message list keeps its own collapse map.

Planned work includes pause/resume of streaming responses, hierarchical snapshot management, streaming AI responses, server-side request proxying and packaging the workspace as a browser extension.

## Documentation

- [`REBUILD_FEATURE_DOCUMENTATION.md`](./REBUILD_FEATURE_DOCUMENTATION.md) — design, workflow, LocalStorage schema and test cases of the rebuild feature.
- [`template/`](./template) — the static HTML/CSS reference used while designing the landing page.

## Contributing

1. Branch off `develop` (`feature/…`, `fix/…`).
2. Keep the existing style: standalone components, signals for state, services for logic and Tailwind utility classes for styling.
3. Write commit messages in the conventional-commit style already used in this repository, for example:

   ```
   feat(chat): add horizontal thread panel for message side discussions
   fix(message-list): make the Collapse/Expand All control toggle both ways
   refactor(ui): modernise the chat layout for small screens
   docs: describe project features, architecture and setup
   ```

4. Run `npm run build` and `npm test` before opening a pull request.

## License

No license file is included in this repository — contact the maintainers before reusing the code.



