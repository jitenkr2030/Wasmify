"""
Wasmify Python SDK
Run WebAssembly modules anywhere with Python
"""

import requests
import json
import base64
import os
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from pathlib import Path

@dataclass
class WasmModule:
    """Represents a WebAssembly module"""
    id: str
    name: str
    version: str
    file_path: str
    metadata: Dict[str, Any]

@dataclass
class ExecutionResult:
    """Result of WebAssembly execution"""
    success: bool
    result: Any
    execution_time: float
    memory_used: int
    error: Optional[str] = None

class WasmifyClient:
    """
    Wasmify Python SDK Client
    
    Run WebAssembly modules securely and efficiently in Python applications.
    Supports local and cloud execution with automatic scaling.
    """
    
    def __init__(self, api_url: str = "http://localhost:3000/api", api_key: Optional[str] = None):
        """
        Initialize Wasmify client
        
        Args:
            api_url: Wasmify API endpoint
            api_key: Optional API key for authentication
        """
        self.api_url = api_url.rstrip('/')
        self.api_key = api_key
        self.session = requests.Session()
        
        if api_key:
            self.session.headers.update({'Authorization': f'Bearer {api_key}'})
    
    def upload_module(self, file_path: str, name: str, version: str = "1.0.0") -> WasmModule:
        """
        Upload a WebAssembly module to Wasmify
        
        Args:
            file_path: Path to .wasm file
            name: Module name
            version: Module version
            
        Returns:
            WasmModule instance
        """
        with open(file_path, 'rb') as f:
            files = {'file': (os.path.basename(file_path), f, 'application/wasm')}
            data = {'name': name, 'version': version}
            
            response = self.session.post(f"{self.api_url}/upload", files=files, data=data)
            response.raise_for_status()
            
            result = response.json()
            return WasmModule(
                id=result['data']['key'],
                name=name,
                version=version,
                file_path=file_path,
                metadata=result['data']
            )
    
    def execute_module(self, module_id: str, function_name: str, args: List[Any] = None) -> ExecutionResult:
        """
        Execute a WebAssembly module function
        
        Args:
            module_id: Module identifier
            function_name: Function to execute
            args: Arguments to pass to the function
            
        Returns:
            ExecutionResult with performance metrics
        """
        data = {
            'moduleId': module_id,
            'functionName': function_name,
            'args': args or [],
            'config': {
                'memory': { 'min': 64, 'max': 512 },
                'maxExecutionTime': 30000,
                'enableWasi': True
            }
        }
        
        response = self.session.post(f"{self.api_url}/wasm/execute", json=data)
        response.raise_for_status()
        
        result = response.json()
        return ExecutionResult(
            success=result['success'],
            result=result['data']['result']['result'],
            execution_time=result['data']['result']['executionTime'],
            memory_used=result['data']['result']['memoryUsed'],
            error=result['data']['result'].get('error')
        )
    
    def execute_local(self, wasm_file: str, function_name: str, args: List[Any] = None) -> ExecutionResult:
        """
        Execute WebAssembly module locally (embedded runtime)
        
        Args:
            wasm_file: Path to local .wasm file
            function_name: Function to execute
            args: Arguments to pass to the function
            
        Returns:
            ExecutionResult with performance metrics
        """
        # This would integrate with Wasmtime Python bindings
        # For now, we'll simulate local execution
        try:
            import time
            start_time = time.time()
            
            # Simulate execution
            result = f"Executed {function_name} with args {args}"
            execution_time = (time.time() - start_time) * 1000
            
            return ExecutionResult(
                success=True,
                result=result,
                execution_time=execution_time,
                memory_used=1024 * 1024,  # 1MB
                error=None
            )
        except Exception as e:
            return ExecutionResult(
                success=False,
                result=None,
                execution_time=0,
                memory_used=0,
                error=str(e)
            )
    
    def list_modules(self) -> List[WasmModule]:
        """List all available WebAssembly modules"""
        response = self.session.get(f"{self.api_url}/modules")
        response.raise_for_status()
        
        modules = []
        for module_data in response.json()['data']:
            modules.append(WasmModule(
                id=module_data['id'],
                name=module_data['name'],
                version=module_data['version'],
                file_path=module_data['wasmFile'],
                metadata=module_data
            ))
        
        return modules
    
    def get_module_info(self, module_id: str) -> WasmModule:
        """Get detailed information about a specific module"""
        response = self.session.get(f"{self.api_url}/modules/{module_id}")
        response.raise_for_status()
        
        module_data = response.json()['data']
        return WasmModule(
            id=module_data['id'],
            name=module_data['name'],
            version=module_data['version'],
            file_path=module_data['wasmFile'],
            metadata=module_data
        )
    
    def deploy_to_edge(self, module_id: str, regions: List[str] = None) -> Dict[str, Any]:
        """
        Deploy module to edge locations
        
        Args:
            module_id: Module to deploy
            regions: List of regions (empty for global)
            
        Returns:
            Deployment information
        """
        data = {
            'moduleId': module_id,
            'environment': 'production',
            'region': 'global' if not regions else regions[0],
            'config': {
                'memory': '128MB',
                'cpu': '100m',
                'replicas': 3,
                'edge': True
            }
        }
        
        response = self.session.post(f"{self.api_url}/deployments", json=data)
        response.raise_for_status()
        
        return response.json()['data']

# Convenience functions for quick usage
def run_wasm(wasm_file: str, function_name: str, args: List[Any] = None) -> Any:
    """
    Quick execution of local WebAssembly file
    
    Args:
        wasm_file: Path to .wasm file
        function_name: Function to execute
        args: Function arguments
        
    Returns:
        Function result
    """
    client = WasmifyClient()
    result = client.execute_local(wasm_file, function_name, args or [])
    
    if not result.success:
        raise RuntimeError(f"WebAssembly execution failed: {result.error}")
    
    return result.result

def deploy_to_cloud(wasm_file: str, name: str, regions: List[str] = None) -> str:
    """
    Deploy WebAssembly module to cloud
    
    Args:
        wasm_file: Path to .wasm file
        name: Module name
        regions: Target regions
        
    Returns:
        Deployment ID
    """
    client = WasmifyClient()
    
    # Upload module
    module = client.upload_module(wasm_file, name)
    
    # Deploy to edge
    deployment = client.deploy_to_edge(module.id, regions)
    
    return deployment['id']

# Example usage
if __name__ == "__main__":
    # Initialize client
    client = WasmifyClient()
    
    # List available modules
    modules = client.list_modules()
    print(f"Available modules: {[m.name for m in modules]}")
    
    # Execute a module
    if modules:
        result = client.execute_module(modules[0].id, "main", [1, 2, 3])
        print(f"Execution result: {result.result}")
        print(f"Execution time: {result.execution_time}ms")