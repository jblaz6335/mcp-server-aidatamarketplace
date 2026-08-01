import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";

const server = new Server({ name: "aidatamarketplace", version: "1.1.0" }, { capabilities: { tools: {} } });
const BASE_URL = "https://ai-data-marketplace-1042299154756.us-central1.run.app/api/v1";

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_candles",
        description: "Get financial candles. Costs 0.05 USDC.",
        inputSchema: { type: "object", properties: { ticker: { type: "string" }, tx_hash: { type: "string", description: "x402 payment tx hash (if previously invoiced)" } } }
      },
      {
        name: "get_leads",
        description: "Get B2B leads by niche or city. Costs 0.05 USDC.",
        inputSchema: { type: "object", properties: { niche: { type: "string" }, city: { type: "string" }, tx_hash: { type: "string" } } }
      },
      {
        name: "enrich_leads",
        description: "Enrich B2B leads. Costs 0.10 USDC.",
        inputSchema: { type: "object", properties: { domains: { type: "array", items: { type: "string" } }, tx_hash: { type: "string" } } }
      },
      {
        name: "get_market_research",
        description: "Get market research. Costs 0.15 USDC.",
        inputSchema: { type: "object", properties: { industry: { type: "string" }, tx_hash: { type: "string" } } }
      },
      {
        name: "get_gigs",
        description: "Get high-value freelance arbitrage gigs. Costs 0.10 USDC.",
        inputSchema: { type: "object", properties: { tx_hash: { type: "string" } } }
      },
      {
        name: "get_signals",
        description: "Get algorithmic crypto trading signals. Costs 0.20 USDC.",
        inputSchema: { type: "object", properties: { tx_hash: { type: "string" } } }
      },
      {
        name: "get_contracts",
        description: "Get government contracts. Costs 0.10 USDC.",
        inputSchema: { type: "object", properties: { tx_hash: { type: "string" } } }
      },
      {
        name: "get_foreclosures",
        description: "Get distressed real estate / foreclosures data. Costs 0.15 USDC.",
        inputSchema: { type: "object", properties: { tx_hash: { type: "string" } } }
      },
      {
        name: "get_github_emails",
        description: "Get GitHub developer emails. Costs 0.10 USDC.",
        inputSchema: { type: "object", properties: { tx_hash: { type: "string" } } }
      },
      {
        name: "get_flights",
        description: "Get live flight tracking data. Costs 0.05 USDC.",
        inputSchema: { type: "object", properties: { tx_hash: { type: "string" } } }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;
    let url = "";
    let method = "GET";
    let data = null;

    if (name === "get_candles") {
      url = BASE_URL + "/candles?ticker=" + (args.ticker || "bitcoin");
    } else if (name === "get_leads") {
      url = BASE_URL + "/leads?";
      if (args.niche) url += "niche=" + args.niche + "&";
      if (args.city) url += "city=" + args.city;
    } else if (name === "enrich_leads") {
      url = BASE_URL + "/enrich_leads";
      method = "POST";
      data = { domains: args.domains || ["stripe.com"] };
    } else if (name === "get_market_research") {
      url = BASE_URL + "/market_research?industry=" + (args.industry || "Technology");
    } else if (name === "get_gigs") {
      url = BASE_URL + "/gigs";
    } else if (name === "get_signals") {
      url = BASE_URL + "/signals";
    } else if (name === "get_contracts") {
      url = BASE_URL + "/contracts";
    } else if (name === "get_foreclosures") {
      url = BASE_URL + "/foreclosures";
    } else if (name === "get_github_emails") {
      url = BASE_URL + "/github_emails";
    } else if (name === "get_flights") {
      url = BASE_URL + "/flights";
    } else {
      throw new Error("Unknown tool");
    }

    const headers = {};
    if (args.tx_hash) {
      headers["x-402-payment-tx"] = args.tx_hash;
      headers["x-402-payment-id"] = "mcp-agent-id";
    }

    const res = await axios({ method, url, data, headers, validateStatus: () => true });
    return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
  } catch (e) {
    return { content: [{ type: "text", text: "Error: " + e.message }] };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
