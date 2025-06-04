import { IconButton } from "./button";
import { ErrorBoundary } from "./error";

import styles from "./agent.module.scss";

import DownloadIcon from "../icons/download.svg";
import UploadIcon from "../icons/upload.svg";
import EditIcon from "../icons/edit.svg";
import AddIcon from "../icons/add.svg";
import CloseIcon from "../icons/close.svg";
import DeleteIcon from "../icons/delete.svg";
import EyeIcon from "../icons/eye.svg";
import CopyIcon from "../icons/copy.svg";
import DragIcon from "../icons/drag.svg";

import https from "https";
import url from "url";

import { DEFAULT_AGENT_AVATAR, Agent, useAgentStore } from "../store/agent";
import {
  ChatMessage,
  createMessage,
  ModelConfig,
  ModelType,
  useAppConfig,
  useChatStore,
} from "../store";
import { MultimodalContent, ROLES } from "../client/api";
import {
  Input,
  List,
  ListItem,
  Modal,
  Popover,
  Select,
  showConfirm,
} from "./ui-lib";
import { Avatar, AvatarPicker } from "./emoji";
import Locale, { AllLangs, ALL_LANG_OPTIONS, Lang } from "../locales";
import { useNavigate } from "react-router-dom";

import chatStyle from "./chat.module.scss";
import { useEffect, useState } from "react";
import {
  copyToClipboard,
  downloadAs,
  getMessageImages,
  readFromFile,
} from "../utils";
import { Updater } from "../typing";
import { ModelConfigList } from "./model-config";
import { FileName, Path } from "../constant";
import { BUILTIN_AGENT_STORE } from "../agents";
import { nanoid } from "nanoid";
import {
  DragDropContext,
  Droppable,
  Draggable,
  OnDragEndResponder,
} from "@hello-pangea/dnd";
import { getMessageTextContent } from "../utils";

// drag and drop helper function
function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
  const result = [...list];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

export function AgentAvatar(props: { avatar: string; model?: ModelType }) {
  return props.avatar !== DEFAULT_AGENT_AVATAR ? (
    <Avatar avatar={props.avatar} />
  ) : (
    <Avatar model={props.model} />
  );
}

export function AgentConfig(props: {
  agent: Agent;
  updateAgent: Updater<Agent>;
  extraListItems?: JSX.Element;
  readonly?: boolean;
  shouldSyncFromGlobal?: boolean;
}) {
  const [showPicker, setShowPicker] = useState(false);

  const updateConfig = (updater: (config: ModelConfig) => void) => {
    if (props.readonly) return;

    const config = { ...props.agent.modelConfig };
    updater(config);
    props.updateAgent((agent) => {
      agent.modelConfig = config;
      // if user changed current session agent, it will disable auto sync
      agent.syncGlobalConfig = false;
    });
  };

  const copyAgentLink = () => {
    const agentLink = `${location.protocol}//${location.host}/#${Path.NewChat}?agent=${props.agent.id}`;
    copyToClipboard(agentLink);
  };

  const globalConfig = useAppConfig();

  return (
    <>
      <ContextPrompts
        context={props.agent.context}
        updateContext={(updater) => {
          const context = props.agent.context.slice();
          updater(context);
          props.updateAgent((agent) => (agent.context = context));
        }}
      />

      <List>
        <ListItem title={Locale.Agent.Config.Avatar}>
          <Popover
            content={
              <AvatarPicker
                onEmojiClick={(emoji) => {
                  props.updateAgent((agent) => (agent.avatar = emoji));
                  setShowPicker(false);
                }}
              ></AvatarPicker>
            }
            open={showPicker}
            onClose={() => setShowPicker(false)}
          >
            <div
              onClick={() => setShowPicker(true)}
              style={{ cursor: "pointer" }}
            >
              <AgentAvatar
                avatar={props.agent.avatar}
                model={props.agent.modelConfig.model}
              />
            </div>
          </Popover>
        </ListItem>
        <ListItem title={Locale.Agent.Config.Name}>
          <input
            type="text"
            value={props.agent.name}
            onInput={(e) =>
              props.updateAgent((agent) => {
                agent.name = e.currentTarget.value;
              })
            }
          ></input>
        </ListItem>
        <ListItem title={Locale.Agent.Config.Description}>
          <input
            type="text"
            value={props.agent.description || ""}
            onInput={(e) =>
              props.updateAgent((agent) => {
                agent.description = e.currentTarget.value;
              })
            }
          ></input>
        </ListItem>
        <ListItem
          title={Locale.Agent.Config.HideContext.Title}
          subTitle={Locale.Agent.Config.HideContext.SubTitle}
        >
          <input
            type="checkbox"
            checked={props.agent.hideContext}
            onChange={(e) => {
              props.updateAgent((agent) => {
                agent.hideContext = e.currentTarget.checked;
              });
            }}
          ></input>
        </ListItem>

        {!props.shouldSyncFromGlobal ? (
          <ListItem
            title={Locale.Agent.Config.Share.Title}
            subTitle={Locale.Agent.Config.Share.SubTitle}
          >
            <IconButton
              icon={<CopyIcon />}
              text={Locale.Agent.Config.Share.Action}
              onClick={copyAgentLink}
            />
          </ListItem>
        ) : null}

        {props.shouldSyncFromGlobal ? (
          <ListItem
            title={Locale.Agent.Config.Sync.Title}
            subTitle={Locale.Agent.Config.Sync.SubTitle}
          >
            <input
              type="checkbox"
              checked={props.agent.syncGlobalConfig}
              onChange={async (e) => {
                const checked = e.currentTarget.checked;
                if (
                  checked &&
                  (await showConfirm(Locale.Agent.Config.Sync.Confirm))
                ) {
                  props.updateAgent((agent) => {
                    agent.syncGlobalConfig = checked;
                    agent.modelConfig = { ...globalConfig.modelConfig };
                  });
                } else if (!checked) {
                  props.updateAgent((agent) => {
                    agent.syncGlobalConfig = checked;
                  });
                }
              }}
            ></input>
          </ListItem>
        ) : null}
      </List>

      <List>
        <ModelConfigList
          modelConfig={{ ...props.agent.modelConfig }}
          updateConfig={updateConfig}
        />
        {props.extraListItems}
      </List>
    </>
  );
}

function ContextPromptItem(props: {
  index: number;
  prompt: ChatMessage;
  update: (prompt: ChatMessage) => void;
  remove: () => void;
}) {
  const [focusingInput, setFocusingInput] = useState(false);

  return (
    <div className={chatStyle["context-prompt-row"]}>
      {!focusingInput && (
        <>
          <div className={chatStyle["context-drag"]}>
            <DragIcon />
          </div>
          <Select
            value={props.prompt.role}
            className={chatStyle["context-role"]}
            onChange={(e) =>
              props.update({
                ...props.prompt,
                role: e.target.value as any,
              })
            }
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </>
      )}
      <Input
        value={getMessageTextContent(props.prompt)}
        type="text"
        className={chatStyle["context-content"]}
        rows={focusingInput ? 5 : 1}
        onFocus={() => setFocusingInput(true)}
        onBlur={() => {
          setFocusingInput(false);
          // If the selection is not removed when the user loses focus, some
          // extensions like "Translate" will always display a floating bar
          window?.getSelection()?.removeAllRanges();
        }}
        onInput={(e) =>
          props.update({
            ...props.prompt,
            content: e.currentTarget.value as any,
          })
        }
      />
      {!focusingInput && (
        <IconButton
          icon={<DeleteIcon />}
          className={chatStyle["context-delete-button"]}
          onClick={() => props.remove()}
          bordered
        />
      )}
    </div>
  );
}

export function ContextPrompts(props: {
  context: ChatMessage[];
  updateContext: (updater: (context: ChatMessage[]) => void) => void;
}) {
  const context = props.context;

  const addContextPrompt = (prompt: ChatMessage, i: number) => {
    props.updateContext((context) => context.splice(i, 0, prompt));
  };

  const removeContextPrompt = (i: number) => {
    props.updateContext((context) => context.splice(i, 1));
  };

  const updateContextPrompt = (i: number, prompt: ChatMessage) => {
    props.updateContext((context) => {
      const images = getMessageImages(context[i]);
      context[i] = prompt;
      if (images.length > 0) {
        const text = getMessageTextContent(context[i]);
        const newContext: MultimodalContent[] = [{ type: "text", text }];
        for (const img of images) {
          newContext.push({ type: "image_url", image_url: { url: img } });
        }
        context[i].content = newContext;
      }
    });
  };

  const onDragEnd: OnDragEndResponder = (result) => {
    if (!result.destination) {
      return;
    }
    const newContext = reorder(
      context,
      result.source.index,
      result.destination.index,
    );
    props.updateContext((context) => {
      context.splice(0, context.length, ...newContext);
    });
  };

  return (
    <>
      <div className={chatStyle["context-prompt"]} style={{ marginBottom: 20 }}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="context-prompt-list">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {context.map((c, i) => (
                  <Draggable
                    draggableId={c.id || i.toString()}
                    index={i}
                    key={c.id}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <ContextPromptItem
                          index={i}
                          prompt={c}
                          update={(prompt) => updateContextPrompt(i, prompt)}
                          remove={() => removeContextPrompt(i)}
                        />
                        <div
                          className={chatStyle["context-prompt-insert"]}
                          onClick={() => {
                            addContextPrompt(
                              createMessage({
                                role: "user",
                                content: "",
                                date: new Date().toLocaleString(),
                              }),
                              i + 1,
                            );
                          }}
                        >
                          <AddIcon />
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {props.context.length === 0 && (
          <div className={chatStyle["context-prompt-row"]}>
            <IconButton
              icon={<AddIcon />}
              text={Locale.Context.Add}
              bordered
              className={chatStyle["context-prompt-button"]}
              onClick={() =>
                addContextPrompt(
                  createMessage({
                    role: "user",
                    content: "",
                    date: "",
                  }),
                  props.context.length,
                )
              }
            />
          </div>
        )}
      </div>
    </>
  );
}

export function AgentPage() {
  const navigate = useNavigate();

  const agentStore = useAgentStore();
  const chatStore = useChatStore();

  const [filterLang, setFilterLang] = useState<Lang>();

  const allAgents = agentStore
    .getAll()
    .filter((m) => !filterLang || m.lang === filterLang);

  const [searchAgents, setSearchAgents] = useState<Agent[]>([]);
  const [searchText, setSearchText] = useState("");
  const agents = searchText.length > 0 ? searchAgents : allAgents;

  // refactored already, now it accurate
  const onSearch = (text: string) => {
    setSearchText(text);
    if (text.length > 0) {
      const result = allAgents.filter((m) =>
        m.name.toLowerCase().includes(text.toLowerCase()),
      );
      setSearchAgents(result);
    } else {
      setSearchAgents(allAgents);
    }
  };

  const [editingAgentId, setEditingAgentId] = useState<string | undefined>();
  const editingAgent = editingAgentId 
    ? (agentStore.get(editingAgentId) ?? allAgents.find(a => a.id === editingAgentId))
    : undefined;
  const closeAgentModal = () => setEditingAgentId(undefined);

  const downloadAll = () => {
    downloadAs(JSON.stringify(agents.filter((v) => !v.builtin)), FileName.Agents);
  };

  const importFromFile = () => {
    readFromFile().then((content) => {
      try {
        const importAgents = JSON.parse(content);
        if (Array.isArray(importAgents)) {
          for (const agent of importAgents) {
            if (agent.name) {
              agentStore.create(agent);
            }
          }
          return;
        }
        //if the content is a single agent.
        if (importAgents.name) {
          agentStore.create(importAgents);
        }
      } catch {}
    });
  };

  function curl(
    urlString: string,
    method: string,
    headers: { [key: string]: string },
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const parsedUrl = url.parse(urlString);

      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port ? parseInt(parsedUrl.port) : 443,
        path: parsedUrl.path,
        method: method,
        headers: headers,
      };

      const req = https.request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          resolve(data);
        });
      });

      req.on("error", (err) => {
        reject(err);
      });

      req.end();
    });
  }

  const importFromLink = () => {
    const url = "https://i8mf90he81.execute-api.us-east-1.amazonaws.com";
    const method = "GET";
    const headers = {};

    curl(url, method, headers)
      .then((data) => {
        console.log(data);
        try {
          const importAgents = JSON.parse(data);
          if (Array.isArray(importAgents)) {
            for (const agent of importAgents) {
              if (agent.name) {
                agentStore.create(agent);
              }
            }
            return;
          }
          //if the content is a single agent.
          if (importAgents.name) {
            agentStore.create(importAgents);
          }
          console.log("import successful");
        } catch (err) {
          console.error(err);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <ErrorBoundary>
      <div className={styles["agent-page"]}>
        <div className="window-header">
          <div className="window-header-title">
            <div className="window-header-main-title">
              {Locale.Agent.Page.Title}
            </div>
            <div className="window-header-submai-title">
              {Locale.Agent.Page.SubTitle(allAgents.length)}
            </div>
          </div>

          <div className="window-actions">
            <div className="window-action-button">
              <IconButton
                icon={<DownloadIcon />}
                bordered
                onClick={downloadAll}
                text={Locale.UI.Export}
              />
            </div>
            <div className="window-action-button">
              <IconButton
                icon={<UploadIcon />}
                text={Locale.UI.Import}
                bordered
                onClick={() => importFromFile()}
              />
            </div>
            <div className="window-action-button">
              <IconButton
                icon={<UploadIcon />}
                text={Locale.UI.ImportFromHub}
                bordered
                onClick={() => importFromLink()}
              />
            </div>
            <div className="window-action-button">
              <IconButton
                icon={<CloseIcon />}
                bordered
                onClick={() => navigate(-1)}
              />
            </div>
          </div>
        </div>

        <div className={styles["agent-page-body"]}>
          <div className={styles["agent-filter"]}>
            <input
              type="text"
              className={styles["search-bar"]}
              placeholder={Locale.Agent.Page.Search}
              autoFocus
              onInput={(e) => onSearch(e.currentTarget.value)}
            />
            <Select
              className={styles["agent-filter-lang"]}
              value={filterLang ?? Locale.Settings.Lang.All}
              onChange={(e) => {
                const value = e.currentTarget.value;
                if (value === Locale.Settings.Lang.All) {
                  setFilterLang(undefined);
                } else {
                  setFilterLang(value as Lang);
                }
              }}
            >
              <option key="all" value={Locale.Settings.Lang.All}>
                {Locale.Settings.Lang.All}
              </option>
              {AllLangs.map((lang) => (
                <option value={lang} key={lang}>
                  {ALL_LANG_OPTIONS[lang]}
                </option>
              ))}
            </Select>

            <IconButton
              className={styles["agent-create"]}
              icon={<AddIcon />}
              text={Locale.Agent.Page.Create}
              bordered
              onClick={() => {
                const createdAgent = agentStore.create();
                setEditingAgentId(createdAgent.id);
              }}
            />
          </div>

          <div>
            {agents.map((m) => (
              <div className={styles["agent-item"]} key={m.id}>
                <div className={styles["agent-header"]}>
                  <div className={styles["agent-icon"]}>
                    <AgentAvatar avatar={m.avatar} model={m.modelConfig.model} />
                  </div>
                  <div className={styles["agent-title"]}>
                    <div className={styles["agent-name"]}>{m.name}</div>
                    <div className={styles["agent-info"] + " one-line"}>
                      {`${Locale.Agent.Item.Info(m.context.length)} / ${
                        ALL_LANG_OPTIONS[m.lang]
                      } / ${m.modelConfig.model}`}
                    </div>
                  </div>
                </div>
                <div className={styles["agent-actions"]}>
                  <IconButton
                    icon={<AddIcon />}
                    text={Locale.Agent.Item.Chat}
                    onClick={() => {
                      chatStore.newSession(m);
                      navigate(Path.Chat);
                    }}
                  />
                  {m.builtin ? (
                    <IconButton
                      icon={<EyeIcon />}
                      text={Locale.Agent.Item.View}
                      onClick={() => setEditingAgentId(m.id)}
                    />
                  ) : (
                    <IconButton
                      icon={<EditIcon />}
                      text={Locale.Agent.Item.Edit}
                      onClick={() => setEditingAgentId(m.id)}
                    />
                  )}
                  {!m.builtin && (
                    <IconButton
                      icon={<DeleteIcon />}
                      text={Locale.Agent.Item.Delete}
                      onClick={async () => {
                        if (await showConfirm(Locale.Agent.Item.DeleteConfirm)) {
                          agentStore.delete(m.id);
                        }
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {editingAgent && (
        <div className="modal-mask">
          <Modal
            title={Locale.Agent.EditModal.Title(editingAgent?.builtin)}
            onClose={closeAgentModal}
            actions={[
              <IconButton
                icon={<DownloadIcon />}
                text={Locale.Agent.EditModal.Download}
                key="export"
                bordered
                onClick={() =>
                  downloadAs(
                    JSON.stringify(editingAgent),
                    `${editingAgent.name}.json`,
                  )
                }
              />,
              <IconButton
                key="copy"
                icon={<CopyIcon />}
                bordered
                text={Locale.Agent.EditModal.Clone}
                onClick={() => {
                  navigate(Path.Agents);
                  agentStore.create(editingAgent);
                  setEditingAgentId(undefined);
                }}
              />,
            ]}
          >
            <AgentConfig
              agent={editingAgent}
              updateAgent={(updater) =>
                agentStore.updateAgent(editingAgentId!, updater)
              }
              readonly={editingAgent.builtin}
            />
          </Modal>
        </div>
      )}
    </ErrorBoundary>
  );
} 