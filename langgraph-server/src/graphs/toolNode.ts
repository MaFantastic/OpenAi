import { ToolNode } from "@langchain/langgraph/prebuilt";
import { tools } from "./tools";

export const toolsNode = new ToolNode(tools);


