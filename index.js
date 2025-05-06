import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Initialize the MCP server
const server = new McpServer({
    name: "Time Server",
    version: "1.0.0"
});

// Define the 'get-time' tool
server.tool("get-time", "", {
    timezone: z.string().optional().describe("IANA timezone name (e.g., 'Asia/Tokyo')"),
    format: z.string().optional().describe("Time format (e.g., 'HH:mm:ss')")
}, async ({ timezone, format }) => {
    try {
        // Determine the time zone
        const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
        // Create a formatter with the specified time zone and format
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        // Get the current time
        const now = new Date();
        const timeString = formatter.format(now);
        return {
            content: [
                {
                    type: "text",
                    text: `Current time in ${tz}: ${timeString}`
                }
            ]
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error retrieving time: ${error instanceof Error ? error.message : String(error)}`
                }
            ]
        };
    }
});

// Start the server using stdio transport
const transport = new StdioServerTransport();
server.connect(transport).catch((err) => {
    console.error("Failed to start MCP server:", err);
});
