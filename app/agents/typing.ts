import { ModelConfig } from "../store";
import { type Agent } from "../store/agent";

export type BuiltinAgent = Omit<Agent, "id" | "modelConfig"> & {
  builtin: Boolean;
  modelConfig: Partial<ModelConfig>;
}; 