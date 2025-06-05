import { MCPClientTest } from "../components/MCPClientTest";

export default function MCPTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          MCP Client Test
        </h1>
        <MCPClientTest />
      </div>
    </div>
  );
} 