import { BUILTIN_AGENTS } from "../agents";
import { getLang, Lang } from "../locales";
import { DEFAULT_TOPIC, ChatMessage } from "./chat";
import { ModelConfig, useAppConfig } from "./config";
import { StoreKey } from "../constant";
import { nanoid } from "nanoid";
import { createPersistStore } from "../utils/store";

export type Agent = {
  id: string;
  createdAt: number;
  avatar: string;
  name: string;
  hideContext?: boolean;
  context: ChatMessage[];
  syncGlobalConfig?: boolean;
  modelConfig: ModelConfig;
  lang: Lang;
  builtin: boolean;
  // Agent-specific properties can be added here
  tools?: string[];
  description?: string;
};

export const DEFAULT_AGENT_STATE = {
  agents: {} as Record<string, Agent>,
};

export type AgentState = typeof DEFAULT_AGENT_STATE;

export const DEFAULT_AGENT_AVATAR = "agent-bot";
export const createEmptyAgent = () =>
  ({
    id: nanoid(),
    avatar: DEFAULT_AGENT_AVATAR,
    name: DEFAULT_TOPIC,
    context: [],
    syncGlobalConfig: true, // use global config as default
    modelConfig: { ...useAppConfig.getState().modelConfig },
    lang: getLang(),
    builtin: false,
    createdAt: Date.now(),
    tools: [],
    description: "",
  }) as Agent;

export const useAgentStore = createPersistStore(
  { ...DEFAULT_AGENT_STATE },

  (set, get) => ({
    create(agent?: Partial<Agent>) {
      const agents = get().agents;
      const id = nanoid();
      agents[id] = {
        ...createEmptyAgent(),
        ...agent,
        id,
        builtin: false,
      };

      set(() => ({ agents }));
      get().markUpdate();

      return agents[id];
    },
    updateAgent(id: string, updater: (agent: Agent) => void) {
      const agents = get().agents;
      const agent = agents[id];
      if (!agent) return;
      const updateAgent = { ...agent };
      updater(updateAgent);
      agents[id] = updateAgent;
      set(() => ({ agents }));
      get().markUpdate();
    },
    delete(id: string) {
      const agents = get().agents;
      delete agents[id];
      set(() => ({ agents }));
      get().markUpdate();
    },

    get(id?: string) {
      return get().agents[id ?? 1145141919810];
    },
    getAll() {
      const userAgents = Object.values(get().agents).sort(
        (a, b) => b.createdAt - a.createdAt,
      );
      const config = useAppConfig.getState();
      if (config.hideBuiltinAgents) return userAgents;
      const buildinAgents = BUILTIN_AGENTS.map(
        (a: any) =>
          ({
            ...a,
            modelConfig: {
              ...config.modelConfig,
              ...a.modelConfig,
            },
          }) as Agent,
      );
      return userAgents.concat(buildinAgents);
    },
    search(text: string) {
      return Object.values(get().agents);
    },
  }),
  {
    name: StoreKey.Agent,
    version: 1.0,

    migrate(state, version) {
      const newState = JSON.parse(JSON.stringify(state)) as AgentState;

      // migrate agent id to nanoid
      if (version < 1) {
        Object.values(newState.agents).forEach((a) => (a.id = nanoid()));
      }

      return newState as any;
    },
  },
); 