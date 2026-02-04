/*
 * Wasmify C SDK
 * Run WebAssembly modules anywhere with C
 */

#ifndef WASMIFY_H
#define WASMIFY_H

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <curl/curl.h>
#include <cjson/cJSON.h>

#ifdef __cplusplus
extern "C" {
#endif

// Error codes
typedef enum {
    WASMIFY_SUCCESS = 0,
    WASMIFY_ERROR_INVALID_PARAM = -1,
    WASMIFY_ERROR_NETWORK = -2,
    WASMIFY_ERROR_PARSE = -3,
    WASMIFY_ERROR_EXECUTION = -4,
    WASMIFY_ERROR_MEMORY = -5
} wasmify_error_t;

// WebAssembly module structure
typedef struct {
    char* id;
    char* name;
    char* version;
    char* file_path;
    cJSON* metadata;
} wasmify_module_t;

// Execution result structure
typedef struct {
    int success;
    char* result;
    double execution_time;
    size_t memory_used;
    char* error;
} wasmify_result_t;

// Client configuration
typedef struct {
    char* api_url;
    char* api_key;
    int timeout;
} wasmify_config_t;

// Client structure
typedef struct {
    wasmify_config_t config;
    CURL* curl;
} wasmify_client_t;

// Memory response structure for HTTP requests
typedef struct {
    char* data;
    size_t size;
} wasmify_response_t;

// Function declarations

/**
 * Create a new Wasmify client
 * @param config Client configuration
 * @return Client instance or NULL on error
 */
wasmify_client_t* wasmify_client_create(wasmify_config_t config);

/**
 * Destroy a Wasmify client
 * @param client Client instance
 */
void wasmify_client_destroy(wasmify_client_t* client);

/**
 * Upload a WebAssembly module
 * @param client Client instance
 * @param file_path Path to .wasm file
 * @param name Module name
 * @param version Module version
 * @param module Output module structure
 * @return Error code
 */
wasmify_error_t wasmify_upload_module(
    wasmify_client_t* client,
    const char* file_path,
    const char* name,
    const char* version,
    wasmify_module_t* module
);

/**
 * Execute a WebAssembly module function
 * @param client Client instance
 * @param module_id Module identifier
 * @param function_name Function to execute
 * @param args Arguments array
 * @param args_count Number of arguments
 * @param result Output result structure
 * @return Error code
 */
wasmify_error_t wasmify_execute_module(
    wasmify_client_t* client,
    const char* module_id,
    const char* function_name,
    char** args,
    int args_count,
    wasmify_result_t* result
);

/**
 * Execute WebAssembly module locally
 * @param file_path Path to .wasm file
 * @param function_name Function to execute
 * @param args Arguments array
 * @param args_count Number of arguments
 * @param result Output result structure
 * @return Error code
 */
wasmify_error_t wasmify_execute_local(
    const char* file_path,
    const char* function_name,
    char** args,
    int args_count,
    wasmify_result_t* result
);

/**
 * List all available modules
 * @param client Client instance
 * @param modules Output array of modules
 * @param modules_count Output number of modules
 * @return Error code
 */
wasmify_error_t wasmify_list_modules(
    wasmify_client_t* client,
    wasmify_module_t** modules,
    int* modules_count
);

/**
 * Deploy module to edge locations
 * @param client Client instance
 * @param module_id Module identifier
 * @param regions Array of regions
 * @param regions_count Number of regions
 * @param deployment_id Output deployment ID
 * @return Error code
 */
wasmify_error_t wasmify_deploy_to_edge(
    wasmify_client_t* client,
    const char* module_id,
    char** regions,
    int regions_count,
    char** deployment_id
);

/**
 * Free module structure
 * @param module Module structure
 */
void wasmify_module_free(wasmify_module_t* module);

/**
 * Free result structure
 * @param result Result structure
 */
void wasmify_result_free(wasmify_result_t* result);

/**
 * Initialize Wasmify SDK
 * @return Error code
 */
wasmify_error_t wasmify_init(void);

/**
 * Cleanup Wasmify SDK
 */
void wasmify_cleanup(void);

#ifdef __cplusplus
}
#endif

#endif // WASMIFY_H