/**
 * Wasmify JavaScript SDK
 * Run WebAssembly modules anywhere with JavaScript
 */

class WasmifyClient {
  /**
   * Wasmify JavaScript SDK Client
   * 
   * Run WebAssembly modules securely and efficiently in JavaScript applications.
   * Supports browser, Node.js, and edge environments with automatic scaling.
   * 
   * @param {Object} options - Configuration options
   * @param {string} options.apiUrl - Wasmify API endpoint
   * @param {string} options.apiKey - Optional API key for authentication
   * @param {boolean} options.enableWasmtime - Enable Wasmtime integration
   */
  constructor(options = {}) {
    this.apiUrl = options.apiUrl || 'http://localhost:3000/api';
    this.apiKey = options.apiKey;
    this.enableWasmtime = options.enableWasmtime || false;
    this.cache = new Map();
    
    // Set up headers
    this.headers = {
      'Content-Type': 'application/json'
    };
    
    if (this.apiKey) {
      this.headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
  }

  /**
   * Upload a WebAssembly module to Wasmify
   * @param {File|Buffer} wasmFile - WebAssembly file
   * @param {Object} metadata - Module metadata
   * @returns {Promise<Object>} Module information
   */
  async uploadModule(wasmFile, metadata = {}) {
    const formData = new FormData();
    formData.append('file', wasmFile);
    formData.append('name', metadata.name || 'unnamed-module');
    formData.append('version', metadata.version || '1.0.0');

    const response = await fetch(`${this.apiUrl}/upload`, {
      method: 'POST',
      body: formData,
      headers: this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {}
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Execute a WebAssembly module function
   * @param {string} moduleId - Module identifier
   * @param {string} functionName - Function to execute
   * @param {Array} args - Arguments to pass to the function
   * @param {Object} config - Execution configuration
   * @returns {Promise<Object>} Execution result
   */
  async executeModule(moduleId, functionName, args = [], config = {}) {
    const data = {
      moduleId,
      functionName,
      args,
      config: {
        memory: { min: 64, max: 512 },
        maxExecutionTime: 30000,
        enableWasi: true,
        ...config
      }
    };

    const response = await fetch(`${this.apiUrl}/wasm/execute`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Execution failed: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      success: result.success,
      result: result.data.result.result,
      executionTime: result.data.result.executionTime,
      memoryUsed: result.data.result.memoryUsed,
      error: result.data.result.error
    };
  }

  /**
   * Execute WebAssembly module locally in browser/Node.js
   * @param {ArrayBuffer} wasmBuffer - WebAssembly binary
   * @param {string} functionName - Function to execute
   * @param {Array} args - Function arguments
   * @returns {Promise<Object>} Execution result
   */
  async executeLocal(wasmBuffer, functionName, args = []) {
    try {
      const startTime = performance.now();
      
      // Instantiate WebAssembly module
      const wasmModule = await WebAssembly.compile(wasmBuffer);
      const instance = await WebAssembly.instantiate(wasmModule, {
        env: {
          memory: new WebAssembly.Memory({ initial: 64, maximum: 512 }),
          table: new WebAssembly.Table({ initial: 1, element: 'anyfunc' })
        }
      });

      // Execute function
      const func = instance.exports[functionName];
      if (!func) {
        throw new Error(`Function '${functionName}' not found in module`);
      }

      const result = func(...args);
      const executionTime = performance.now() - startTime;

      return {
        success: true,
        result,
        executionTime,
        memoryUsed: wasmBuffer.byteLength,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        result: null,
        executionTime: 0,
        memoryUsed: 0,
        error: error.message
      };
    }
  }

  /**
   * List all available WebAssembly modules
   * @returns {Promise<Array>} List of modules
   */
  async listModules() {
    const response = await fetch(`${this.apiUrl}/modules`, {
      headers: this.headers
    });

    if (!response.ok) {
      throw new Error(`Failed to list modules: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Get detailed information about a specific module
   * @param {string} moduleId - Module identifier
   * @returns {Promise<Object>} Module information
   */
  async getModuleInfo(moduleId) {
    const response = await fetch(`${this.apiUrl}/modules/${moduleId}`, {
      headers: this.headers
    });

    if (!response.ok) {
      throw new Error(`Failed to get module info: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Deploy module to edge locations
   * @param {string} moduleId - Module to deploy
   * @param {Array} regions - List of regions (empty for global)
   * @returns {Promise<Object>} Deployment information
   */
  async deployToEdge(moduleId, regions = []) {
    const data = {
      moduleId,
      environment: 'production',
      region: regions.length > 0 ? regions[0] : 'global',
      config: {
        memory: '128MB',
        cpu: '100m',
        replicas: 3,
        edge: true
      }
    };

    const response = await fetch(`${this.apiUrl}/deployments`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Deployment failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Create a package in the registry
   * @param {Object} packageData - Package information
   * @returns {Promise<Object>} Package information
   */
  async createPackage(packageData) {
    const response = await fetch(`${this.apiUrl}/packages`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(packageData)
    });

    if (!response.ok) {
      throw new Error(`Package creation failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Search for packages in the registry
   * @param {string} query - Search query
   * @param {Object} filters - Search filters
   * @returns {Promise<Array>} Search results
   */
  async searchPackages(query, filters = {}) {
    const params = new URLSearchParams({
      q: query,
      ...filters
    });

    const response = await fetch(`${this.apiUrl}/packages/search?${params}`, {
      headers: this.headers
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }
}

// Browser/Node.js convenience functions
async function runWasm(wasmFile, functionName, args = []) {
  /**
   * Quick execution of WebAssembly file
   * @param {File|ArrayBuffer} wasmFile - WebAssembly file
   * @param {string} functionName - Function to execute
   * @param {Array} args - Function arguments
   * @returns {Promise<any>} Function result
   */
  let wasmBuffer;
  
  if (wasmFile instanceof File) {
    wasmBuffer = await wasmFile.arrayBuffer();
  } else {
    wasmBuffer = wasmFile;
  }

  const client = new WasmifyClient();
  const result = await client.executeLocal(wasmBuffer, functionName, args);
  
  if (!result.success) {
    throw new Error(`WebAssembly execution failed: ${result.error}`);
  }
  
  return result.result;
}

async function deployToCloud(wasmFile, name, regions = []) {
  /**
   * Deploy WebAssembly module to cloud
   * @param {File} wasmFile - WebAssembly file
   * @param {string} name - Module name
   * @param {Array} regions - Target regions
   * @returns {Promise<string>} Deployment ID
   */
  const client = new WasmifyClient();
  
  // Upload module
  const wasmModule = await client.uploadModule(wasmFile, { name });
  
  // Deploy to edge
  const deployment = await client.deployToEdge(wasmModule.id, regions);
  
  return deployment.id;
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  // Node.js
  module.exports = {
    WasmifyClient,
    runWasm,
    deployToCloud
  };
} else if (typeof window !== 'undefined') {
  // Browser
  window.WasmifySDK = {
    WasmifyClient,
    runWasm,
    deployToCloud
  };
}

// Example usage
if (typeof window !== 'undefined') {
  // Browser example
  window.WasmifyExample = async () => {
    const client = new WasmifyClient();
    
    // List modules
    const modules = await client.listModules();
    console.log('Available modules:', modules.map(m => m.name));
    
    // Execute a module
    if (modules.length > 0) {
      const result = await client.executeModule(modules[0].id, 'main', [1, 2, 3]);
      console.log('Execution result:', result.result);
      console.log('Execution time:', result.executionTime + 'ms');
    }
  };
}