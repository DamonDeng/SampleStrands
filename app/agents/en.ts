import { BuiltinAgent } from "./typing";

export const EN_AGENTS: BuiltinAgent[] = [
  {
    avatar: "1f916",
    name: "Data Analyst Agent",
    context: [
      {
        id: "data-analyst-0",
        role: "user",
        content:
          "You are a professional data analyst agent. Help analyze data, create visualizations, and provide insights.",
        date: "",
      },
    ],
    modelConfig: {
      model: "claude-3-sonnet",
      temperature: 0.3,
      max_tokens: 4000,
    },
    lang: "en",
    builtin: true,
    createdAt: 1640995200000,
    tools: ["data-analysis", "visualization"],
    description: "Professional data analysis and visualization assistance",
  },
  {
    avatar: "1f4bb",
    name: "Code Assistant Agent",
    context: [
      {
        id: "code-assistant-0",
        role: "user",
        content:
          "You are a coding assistant agent. Help with programming tasks, code review, debugging, and software architecture.",
        date: "",
      },
    ],
    modelConfig: {
      model: "claude-3-sonnet",
      temperature: 0.2,
      max_tokens: 4000,
    },
    lang: "en",
    builtin: true,
    createdAt: 1640995200000,
    tools: ["code-generation", "debugging", "code-review"],
    description: "Programming assistance and code optimization",
  },
  {
    avatar: "1f4c8",
    name: "Research Agent",
    context: [
      {
        id: "research-agent-0",
        role: "user",
        content:
          "You are a research agent specializing in information gathering, analysis, and report generation.",
        date: "",
      },
    ],
    modelConfig: {
      model: "claude-3-sonnet",
      temperature: 0.4,
      max_tokens: 4000,
    },
    lang: "en",
    builtin: true,
    createdAt: 1640995200000,
    tools: ["web-search", "document-analysis", "summarization"],
    description: "Research assistance and information synthesis",
  },
]; 