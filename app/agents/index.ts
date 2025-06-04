import { Agent } from "../store/agent";
import { EN_AGENTS } from "./en";

import { type BuiltinAgent } from "./typing";
export { type BuiltinAgent } from "./typing";

export const BUILTIN_AGENT_ID = 200000;

export const BUILTIN_AGENT_STORE = {
  buildinId: BUILTIN_AGENT_ID,
  agents: {} as Record<string, BuiltinAgent>,
  get(id?: string) {
    if (!id) return undefined;
    return this.agents[id] as Agent | undefined;
  },
  add(a: BuiltinAgent) {
    const agent = { ...a, id: this.buildinId++, builtin: true };
    this.agents[agent.id] = agent;
    return agent;
  },
};

export const BUILTIN_AGENTS: BuiltinAgent[] = [...EN_AGENTS].map(
  (a) => BUILTIN_AGENT_STORE.add(a),
); 