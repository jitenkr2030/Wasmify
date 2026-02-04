package wasmify

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

// WasmModule represents a WebAssembly module
type WasmModule struct {
	ID       string                 `json:"id"`
	Name     string                 `json:"name"`
	Version  string                 `json:"version"`
	FilePath string                 `json:"filePath"`
	Metadata map[string]interface{} `json:"metadata"`
}

// ExecutionResult represents the result of WebAssembly execution
type ExecutionResult struct {
	Success       bool        `json:"success"`
	Result        interface{} `json:"result"`
	ExecutionTime float64     `json:"executionTime"`
	MemoryUsed    int64       `json:"memoryUsed"`
	Error         string      `json:"error,omitempty"`
}

// Config represents client configuration
type Config struct {
	APIURL  string
	APIKey  string
	Timeout time.Duration
}

// Client represents the Wasmify Go client
type Client struct {
	config    Config
	httpClient *http.Client
}

// NewClient creates a new Wasmify client
func NewClient(config Config) *Client {
	if config.Timeout == 0 {
		config.Timeout = 30 * time.Second
	}
	
	return &Client{
		config: config,
		httpClient: &http.Client{
			Timeout: config.Timeout,
		},
	}
}

// NewDefaultClient creates a client with default configuration
func NewDefaultClient() *Client {
	return NewClient(Config{
		APIURL: "http://localhost:3000/api",
	})
}

// UploadModule uploads a WebAssembly module to Wasmify
func (c *Client) UploadModule(filePath, name, version string) (*WasmModule, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to open file: %w", err)
	}
	defer file.Close()

	// Create multipart form
	var requestBody bytes.Buffer
	writer := multipart.NewWriter(&requestBody)

	// Add file
	part, err := writer.CreateFormFile("file", filepath.Base(filePath))
	if err != nil {
		return nil, fmt.Errorf("failed to create form file: %w", err)
	}
	
	_, err = io.Copy(part, file)
	if err != nil {
		return nil, fmt.Errorf("failed to copy file: %w", err)
	}

	// Add form fields
	_ = writer.WriteField("name", name)
	_ = writer.WriteField("version", version)
	
	err = writer.Close()
	if err != nil {
		return nil, fmt.Errorf("failed to close writer: %w", err)
	}

	// Create request
	req, err := http.NewRequest("POST", c.config.APIURL+"/upload", &requestBody)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", writer.FormDataContentType())
	if c.config.APIKey != "" {
		req.Header.Set("Authorization", "Bearer "+c.config.APIKey)
	}

	// Send request
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("upload failed with status: %s", resp.Status)
	}

	// Parse response
	var result struct {
		Success bool `json:"success"`
		Data    struct {
			Key     string                 `json:"key"`
			ETag    string                 `json:"etag"`
			Size    int64                  `json:"size"`
			Headers map[string]interface{} `json:"headers"`
		} `json:"data"`
	}

	err = json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	if !result.Success {
		return nil, fmt.Errorf("upload failed")
	}

	return &WasmModule{
		ID:       result.Data.Key,
		Name:     name,
		Version:  version,
		FilePath: filePath,
		Metadata: map[string]interface{}{
			"etag":    result.Data.ETag,
			"size":    result.Data.Size,
			"headers": result.Data.Headers,
		},
	}, nil
}

// ExecuteModule executes a WebAssembly module function
func (c *Client) ExecuteModule(moduleID, functionName string, args []interface{}, config map[string]interface{}) (*ExecutionResult, error) {
	requestData := map[string]interface{}{
		"moduleId":     moduleID,
		"functionName": functionName,
		"args":         args,
		"config": map[string]interface{}{
			"memory":          map[string]int{"min": 64, "max": 512},
			"maxExecutionTime": 30000,
			"enableWasi":      true,
		},
	}

	// Merge user config
	for k, v := range config {
		requestData["config"].(map[string]interface{})[k] = v
	}

	jsonData, err := json.Marshal(requestData)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequest("POST", c.config.APIURL+"/wasm/execute", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	if c.config.APIKey != "" {
		req.Header.Set("Authorization", "Bearer "+c.config.APIKey)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("execution failed with status: %s", resp.Status)
	}

	var result struct {
		Success bool `json:"success"`
		Data    struct {
			Result struct {
				Result        interface{} `json:"result"`
				ExecutionTime float64     `json:"executionTime"`
				MemoryUsed    int64       `json:"memoryUsed"`
				Error         string      `json:"error,omitempty"`
			} `json:"result"`
		} `json:"data"`
	}

	err = json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	if !result.Success {
		return nil, fmt.Errorf("execution failed")
	}

	return &ExecutionResult{
		Success:       true,
		Result:        result.Data.Result.Result,
		ExecutionTime: result.Data.Result.ExecutionTime,
		MemoryUsed:    result.Data.Result.MemoryUsed,
		Error:         result.Data.Result.Error,
	}, nil
}

// ListModules lists all available WebAssembly modules
func (c *Client) ListModules() ([]*WasmModule, error) {
	req, err := http.NewRequest("GET", c.config.APIURL+"/modules", nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	if c.config.APIKey != "" {
		req.Header.Set("Authorization", "Bearer "+c.config.APIKey)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("list failed with status: %s", resp.Status)
	}

	var result struct {
		Success bool `json:"success"`
		Data    []struct {
			ID          string                 `json:"id"`
			Name        string                 `json:"name"`
			Version     string                 `json:"version"`
			WasmFile    string                 `json:"wasmFile"`
			Description string                 `json:"description"`
			Language    string                 `json:"language"`
			Size        int64                  `json:"size"`
			Hash        string                 `json:"hash"`
			IsPublic    bool                   `json:"isPublic"`
			CreatedAt   string                 `json:"createdAt"`
			UpdatedAt   string                 `json:"updatedAt"`
		} `json:"data"`
	}

	err = json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	if !result.Success {
		return nil, fmt.Errorf("list failed")
	}

	modules := make([]*WasmModule, len(result.Data))
	for i, moduleData := range result.Data {
		modules[i] = &WasmModule{
			ID:       moduleData.ID,
			Name:     moduleData.Name,
			Version:  moduleData.Version,
			FilePath: moduleData.WasmFile,
			Metadata: map[string]interface{}{
				"description": moduleData.Description,
				"language":    moduleData.Language,
				"size":        moduleData.Size,
				"hash":        moduleData.Hash,
				"isPublic":    moduleData.IsPublic,
				"createdAt":   moduleData.CreatedAt,
				"updatedAt":   moduleData.UpdatedAt,
			},
		}
	}

	return modules, nil
}

// DeployToEdge deploys a module to edge locations
func (c *Client) DeployToEdge(moduleID string, regions []string) (map[string]interface{}, error) {
	requestData := map[string]interface{}{
		"moduleId":    moduleID,
		"environment": "production",
		"region":      "global",
		"config": map[string]interface{}{
			"memory":   "128MB",
			"cpu":      "100m",
			"replicas": 3,
			"edge":     true,
		},
	}

	if len(regions) > 0 {
		requestData["region"] = regions[0]
	}

	jsonData, err := json.Marshal(requestData)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequest("POST", c.config.APIURL+"/deployments", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	if c.config.APIKey != "" {
		req.Header.Set("Authorization", "Bearer "+c.config.APIKey)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("deployment failed with status: %s", resp.Status)
	}

	var result struct {
		Success bool                   `json:"success"`
		Data    map[string]interface{} `json:"data"`
	}

	err = json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	if !result.Success {
		return nil, fmt.Errorf("deployment failed")
	}

	return result.Data, nil
}

// ExecuteLocal executes WebAssembly module locally (simulated)
func ExecuteLocal(wasmFilePath, functionName string, args []interface{}) (*ExecutionResult, error) {
	// This would integrate with Wasmtime Go bindings
	// For now, we'll simulate local execution
	startTime := time.Now()
	
	// Simulate execution
	result := fmt.Sprintf("Executed %s with args %v", functionName, args)
	executionTime := time.Since(startTime).Seconds() * 1000

	return &ExecutionResult{
		Success:       true,
		Result:        result,
		ExecutionTime: executionTime,
		MemoryUsed:    1024 * 1024, // 1MB
		Error:         "",
	}, nil
}

// Convenience functions
func RunWasm(wasmFilePath, functionName string, args []interface{}) (interface{}, error) {
	result, err := ExecuteLocal(wasmFilePath, functionName, args)
	if err != nil {
		return nil, err
	}

	if !result.Success {
		return nil, fmt.Errorf("WebAssembly execution failed: %s", result.Error)
	}

	return result.Result, nil
}

func DeployToCloud(wasmFilePath, name string, regions []string) (string, error) {
	client := NewDefaultClient()
	
	// Upload module
	module, err := client.UploadModule(wasmFilePath, name, "1.0.0")
	if err != nil {
		return "", err
	}

	// Deploy to edge
	deployment, err := client.DeployToEdge(module.ID, regions)
	if err != nil {
		return "", err
	}

	return deployment["id"].(string), nil
}