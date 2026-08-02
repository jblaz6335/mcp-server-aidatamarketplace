import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";

const server = new Server({ name: "aidatamarketplace", version: "1.2.0" }, { capabilities: { tools: {} } });
const BASE_URL = "https://ai-data-marketplace-1042299154756.us-central1.run.app/api/v1";

server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools = [
      {
        name: "get_candles",
        description: "Get financial candles. Costs 0.05 USDC.",
        inputSchema: { type: "object", properties: { ticker: { type: "string" }, tx_hash: { type: "string", description: "x402 payment tx hash (if previously invoiced)" } } }
      },
      {
        name: "get_leads",
        description: "Get a curated B2B lead snapshot by niche or city. Costs 0.05 USDC.",
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
        description: "Get a curated freelance-gig snapshot. Costs 0.10 USDC.",
        inputSchema: { type: "object", properties: { tx_hash: { type: "string" } } }
      },
      {
        name: "get_signals",
        description: "Get a curated algorithmic-signal snapshot. Costs 0.20 USDC.",
        inputSchema: { type: "object", properties: { tx_hash: { type: "string" } } }
      },
      {
        name: "get_contracts",
        description: "Get a curated government-contract snapshot. Costs 0.10 USDC.",
        inputSchema: { type: "object", properties: { tx_hash: { type: "string" } } }
      },
      {
        name: "get_foreclosures",
        description: "Get a curated distressed-real-estate snapshot. Costs 0.15 USDC.",
        inputSchema: { type: "object", properties: { tx_hash: { type: "string" } } }
      },
      {
        name: "get_github_emails",
        description: "Get a curated GitHub developer-contact snapshot. Costs 0.10 USDC.",
        inputSchema: { type: "object", properties: { tx_hash: { type: "string" } } }
      },
      {
        name: "get_flights",
        description: "Get a curated flight-data snapshot. Costs 0.05 USDC.",
        inputSchema: { type: "object", properties: { tx_hash: { type: "string" } } }
      }
    ];
  return {
    tools: tools.map(tool => ({
      ...tool,
      inputSchema: {
        ...tool.inputSchema,
        properties: {
          ...tool.inputSchema.properties,
          payment_id: {
            type: "string",
            description: "payment_id returned by the marketplace's 402 invoice"
          }
        }
      }
    }))
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;
    let url = "";
    let method = "GET";
    let data = null;

    if (name === "get_candles") {
      url = BASE_URL + "/candles?ticker=" + encodeURIComponent(args.ticker || "bitcoin");
    } else if (name === "get_leads") {
      url = BASE_URL + "/leads?";
      if (args.niche) url += "niche=" + encodeURIComponent(args.niche) + "&";
      if (args.city) url += "city=" + encodeURIComponent(args.city);
    } else if (name === "enrich_leads") {
      url = BASE_URL + "/enrich_leads";
      method = "POST";
      data = { domains: args.domains || ["stripe.com"] };
    } else if (name === "get_market_research") {
      url = BASE_URL + "/market_research?industry=" + encodeURIComponent(args.industry || "Technology");
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
      if (!args.payment_id) {
        throw new Error("payment_id is required with tx_hash. Use the payment_id returned by the 402 invoice.");
      }
      headers["x-402-payment-tx"] = args.tx_hash;
      headers["x-402-payment-id"] = args.payment_id;
    }

    const res = await axios({ method, url, data, headers, timeout: 30000, validateStatus: () => true });
    return {
      isError: res.status >= 400,
      content: [{ type: "text", text: JSON.stringify({ http_status: res.status, ...res.data }, null, 2) }]
    };
  } catch (e) {
    return { content: [{ type: "text", text: "Error: " + e.message }] };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
