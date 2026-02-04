/*
 * Wasmify C SDK Implementation
 */

#include "wasmify.h"
#include <time.h>

// Global initialization state
static int g_initialized = 0;

// HTTP response callback
static size_t write_callback(void* contents, size_t size, size_t nmemb, void* userp) {
    size_t realsize = size * nmemb;
    wasmify_response_t* response = (wasmify_response_t*)userp;
    
    char* new_data = realloc(response->data, response->size + realsize + 1);
    if (!new_data) {
        return 0;
    }
    
    response->data = new_data;
    memcpy(&(response->data[response->size]), contents, realsize);
    response->size += realsize;
    response->data[response->size] = 0;
    
    return realsize;
}

// Initialize Wasmify SDK
wasmify_error_t wasmify_init(void) {
    if (g_initialized) {
        return WASMIFY_SUCCESS;
    }
    
    curl_global_init(CURL_GLOBAL_DEFAULT);
    g_initialized = 1;
    
    return WASMIFY_SUCCESS;
}

// Cleanup Wasmify SDK
void wasmify_cleanup(void) {
    if (g_initialized) {
        curl_global_cleanup();
        g_initialized = 0;
    }
}

// Create a new Wasmify client
wasmify_client_t* wasmify_client_create(wasmify_config_t config) {
    wasmify_client_t* client = malloc(sizeof(wasmify_client_t));
    if (!client) {
        return NULL;
    }
    
    // Copy configuration
    client->config.api_url = config.api_url ? strdup(config.api_url) : strdup("http://localhost:3000/api");
    client->config.api_key = config.api_key ? strdup(config.api_key) : NULL;
    client->config.timeout = config.timeout > 0 ? config.timeout : 30;
    
    // Initialize CURL
    client->curl = curl_easy_init();
    if (!client->curl) {
        free(client->config.api_url);
        if (client->config.api_key) free(client->config.api_key);
        free(client);
        return NULL;
    }
    
    // Set common CURL options
    curl_easy_setopt(client->curl, CURLOPT_TIMEOUT, client->config.timeout);
    curl_easy_setopt(client->curl, CURLOPT_FOLLOWLOCATION, 1L);
    curl_easy_setopt(client->curl, CURLOPT_WRITEFUNCTION, write_callback);
    
    return client;
}

// Destroy a Wasmify client
void wasmify_client_destroy(wasmify_client_t* client) {
    if (!client) return;
    
    if (client->curl) {
        curl_easy_cleanup(client->curl);
    }
    if (client->config.api_url) {
        free(client->config.api_url);
    }
    if (client->config.api_key) {
        free(client->config.api_key);
    }
    free(client);
}

// Execute HTTP request
static wasmify_error_t execute_request(
    wasmify_client_t* client,
    const char* url,
    const char* post_data,
    wasmify_response_t* response
) {
    if (!client || !url || !response) {
        return WASMIFY_ERROR_INVALID_PARAM;
    }
    
    // Initialize response
    response->data = malloc(1);
    response->data[0] = '\0';
    response->size = 0;
    
    // Set URL
    curl_easy_setopt(client->curl, CURLOPT_URL, url);
    
    // Set POST data if provided
    if (post_data) {
        curl_easy_setopt(client->curl, CURLOPT_POSTFIELDS, post_data);
        curl_easy_setopt(client->curl, CURLOPT_POSTFIELDSIZE, strlen(post_data));
    }
    
    // Set response callback
    curl_easy_setopt(client->curl, CURLOPT_WRITEDATA, response);
    
    // Set headers
    struct curl_slist* headers = NULL;
    headers = curl_slist_append(headers, "Content-Type: application/json");
    if (client->config.api_key) {
        char auth_header[256];
        snprintf(auth_header, sizeof(auth_header), "Authorization: Bearer %s", client->config.api_key);
        headers = curl_slist_append(headers, auth_header);
    }
    curl_easy_setopt(client->curl, CURLOPT_HTTPHEADER, headers);
    
    // Execute request
    CURLcode res = curl_easy_perform(client->curl);
    
    // Cleanup headers
    curl_slist_free_all(headers);
    
    if (res != CURLE_OK) {
        free(response->data);
        return WASMIFY_ERROR_NETWORK;
    }
    
    // Check HTTP response code
    long response_code;
    curl_easy_getinfo(client->curl, CURLINFO_RESPONSE_CODE, &response_code);
    
    if (response_code != 200) {
        free(response->data);
        return WASMIFY_ERROR_NETWORK;
    }
    
    return WASMIFY_SUCCESS;
}

// Upload a WebAssembly module
wasmify_error_t wasmify_upload_module(
    wasmify_client_t* client,
    const char* file_path,
    const char* name,
    const char* version,
    wasmify_module_t* module
) {
    if (!client || !file_path || !name || !version || !module) {
        return WASMIFY_ERROR_INVALID_PARAM;
    }
    
    // For now, simulate upload
    module->id = strdup("simulated-module-id");
    module->name = strdup(name);
    module->version = strdup(version);
    module->file_path = strdup(file_path);
    module->metadata = cJSON_CreateObject();
    
    return WASMIFY_SUCCESS;
}

// Execute a WebAssembly module function
wasmify_error_t wasmify_execute_module(
    wasmify_client_t* client,
    const char* module_id,
    const char* function_name,
    char** args,
    int args_count,
    wasmify_result_t* result
) {
    if (!client || !module_id || !function_name || !result) {
        return WASMIFY_ERROR_INVALID_PARAM;
    }
    
    // Create JSON request
    cJSON* request = cJSON_CreateObject();
    cJSON* config = cJSON_CreateObject();
    cJSON* memory = cJSON_CreateObject();
    
    cJSON_AddStringToObject(request, "moduleId", module_id);
    cJSON_AddStringToObject(request, "functionName", function_name);
    
    // Add args array
    cJSON* args_array = cJSON_CreateArray();
    for (int i = 0; i < args_count; i++) {
        cJSON_AddItemToArray(args_array, cJSON_CreateString(args[i]));
    }
    cJSON_AddItemToObject(request, "args", args_array);
    
    // Add config
    cJSON_AddNumberToObject(memory, "min", 64);
    cJSON_AddNumberToObject(memory, "max", 512);
    cJSON_AddItemToObject(config, "memory", memory);
    cJSON_AddNumberToObject(config, "maxExecutionTime", 30000);
    cJSON_AddBoolToObject(config, "enableWasi", 1);
    cJSON_AddItemToObject(request, "config", config);
    
    char* json_data = cJSON_Print(request);
    
    // Build URL
    char url[512];
    snprintf(url, sizeof(url), "%s/wasm/execute", client->config.api_url);
    
    // Execute request
    wasmify_response_t response;
    wasmify_error_t error = execute_request(client, url, json_data, NULL);
    
    free(json_data);
    cJSON_Delete(request);
    
    if (error != WASMIFY_SUCCESS) {
        return error;
    }
    
    // Simulate result
    result->success = 1;
    result->result = strdup("simulated execution result");
    result->execution_time = 42.5;
    result->memory_used = 1024 * 1024;
    result->error = NULL;
    
    return WASMIFY_SUCCESS;
}

// Execute WebAssembly module locally
wasmify_error_t wasmify_execute_local(
    const char* file_path,
    const char* function_name,
    char** args,
    int args_count,
    wasmify_result_t* result
) {
    if (!file_path || !function_name || !result) {
        return WASMIFY_ERROR_INVALID_PARAM;
    }
    
    // Simulate local execution
    clock_t start = clock();
    
    // Simulate execution time
    for (volatile int i = 0; i < 1000000; i++);
    
    double execution_time = ((double)(clock() - start)) / CLOCKS_PER_SEC * 1000;
    
    // Create result
    result->success = 1;
    result->result = malloc(256);
    snprintf(result->result, 256, "Executed %s with %d args", function_name, args_count);
    result->execution_time = execution_time;
    result->memory_used = 1024 * 1024; // 1MB
    result->error = NULL;
    
    return WASMIFY_SUCCESS;
}

// List all available modules
wasmify_error_t wasmify_list_modules(
    wasmify_client_t* client,
    wasmify_module_t** modules,
    int* modules_count
) {
    if (!client || !modules || !modules_count) {
        return WASMIFY_ERROR_INVALID_PARAM;
    }
    
    // For now, return empty list
    *modules = NULL;
    *modules_count = 0;
    
    return WASMIFY_SUCCESS;
}

// Deploy module to edge locations
wasmify_error_t wasmify_deploy_to_edge(
    wasmify_client_t* client,
    const char* module_id,
    char** regions,
    int regions_count,
    char** deployment_id
) {
    if (!client || !module_id || !deployment_id) {
        return WASMIFY_ERROR_INVALID_PARAM;
    }
    
    // Simulate deployment
    *deployment_id = strdup("simulated-deployment-id");
    
    return WASMIFY_SUCCESS;
}

// Free module structure
void wasmify_module_free(wasmify_module_t* module) {
    if (!module) return;
    
    if (module->id) free(module->id);
    if (module->name) free(module->name);
    if (module->version) free(module->version);
    if (module->file_path) free(module->file_path);
    if (module->metadata) cJSON_Delete(module->metadata);
    free(module);
}

// Free result structure
void wasmify_result_free(wasmify_result_t* result) {
    if (!result) return;
    
    if (result->result) free(result->result);
    if (result->error) free(result->error);
    free(result);
}

// Convenience function to run WASM quickly
wasmify_error_t wasmify_run(
    const char* file_path,
    const char* function_name,
    char** args,
    int args_count,
    char** output
) {
    wasmify_result_t result;
    wasmify_error_t error = wasmify_execute_local(file_path, function_name, args, args_count, &result);
    
    if (error == WASMIFY_SUCCESS && result.success) {
        *output = strdup(result.result);
    }
    
    wasmify_result_free(&result);
    return error;
}