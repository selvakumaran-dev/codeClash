// Code Execution Service using Piston API (Free & Open Source)
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Piston is a free, open-source code execution engine
// Public instance: https://emkc.org/api/v2/piston
const PISTON_API = process.env.PISTON_API_URL || 'https://emkc.org/api/v2/piston';

// Language identifiers for Piston
const LANGUAGE_MAP = {
    javascript: { language: 'javascript', version: '18.15.0' },
    python: { language: 'python', version: '3.10.0' },
    java: { language: 'java', version: '15.0.2' },
    cpp: { language: 'c++', version: '10.2.0' },
    c: { language: 'c', version: '10.2.0' },
    csharp: { language: 'csharp', version: '6.12.0' },
    go: { language: 'go', version: '1.16.2' },
    rust: { language: 'rust', version: '1.68.2' },
    typescript: { language: 'typescript', version: '5.0.3' },
    kotlin: { language: 'kotlin', version: '1.8.20' },
    swift: { language: 'swift', version: '5.3.3' },
    ruby: { language: 'ruby', version: '3.0.1' },
    php: { language: 'php', version: '8.2.3' }
};

class CodeExecutor {
    /**
     * Submit code for execution using Piston API
     * @param {string} code - Source code
     * @param {string} language - Programming language
     * @param {string} stdin - Input data
     * @param {number} timeLimit - Time limit in seconds (default: 3)
     * @returns {Promise<Object>} Execution result
     */
    async executeCode(code, language, stdin = '', timeLimit = 3) {
        try {
            const langConfig = LANGUAGE_MAP[language.toLowerCase()];

            if (!langConfig) {
                throw new Error(`Unsupported language: ${language}`);
            }

            const startTime = Date.now();

            // Execute code using Piston API
            const response = await axios.post(
                `${PISTON_API}/execute`,
                {
                    language: langConfig.language,
                    version: langConfig.version,
                    files: [
                        {
                            name: `main.${this.getFileExtension(language)}`,
                            content: code
                        }
                    ],
                    stdin: stdin,
                    compile_timeout: 10000,
                    run_timeout: timeLimit * 1000,
                    compile_memory_limit: -1,
                    run_memory_limit: -1
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    timeout: 15000 // 15 second timeout
                }
            );

            const endTime = Date.now();
            const executionTime = (endTime - startTime) / 1000;

            const result = response.data;

            // Piston returns output in 'run' object
            const output = result.run?.output || '';
            const stderr = result.run?.stderr || '';
            const compileOutput = result.compile?.output || '';

            return {
                success: result.run?.code === 0 && !stderr,
                status: result.run?.code === 0 ? 'Accepted' : 'Runtime Error',
                statusId: result.run?.code || 0,
                stdout: output.trim(),
                stderr: stderr.trim(),
                compileOutput: compileOutput.trim(),
                time: executionTime,
                memory: 0, // Piston doesn't provide memory usage
                error: result.run?.code !== 0 ? (stderr || 'Execution failed') : null
            };
        } catch (error) {
            console.error('[CODE EXECUTOR] Error:', error.message);

            // Handle specific error types
            if (error.code === 'ECONNABORTED') {
                return {
                    success: false,
                    error: 'Execution timeout - Code took too long to execute',
                    stdout: '',
                    stderr: 'Network timeout',
                    time: 0,
                    memory: 0
                };
            }

            if (error.response?.status === 429) {
                return {
                    success: false,
                    error: 'Rate limit exceeded. Please try again in a moment.',
                    stdout: '',
                    stderr: 'Too many requests',
                    time: 0,
                    memory: 0
                };
            }

            if (error.response?.status === 503) {
                return {
                    success: false,
                    error: 'Code execution service temporarily unavailable. Please try again.',
                    stdout: '',
                    stderr: 'Service unavailable',
                    time: 0,
                    memory: 0
                };
            }

            return {
                success: false,
                error: error.message,
                stdout: '',
                stderr: error.message,
                time: 0,
                memory: 0
            };
        }
    }

    /**
     * Get file extension for language
     */
    getFileExtension(language) {
        const extensions = {
            javascript: 'js',
            python: 'py',
            java: 'java',
            cpp: 'cpp',
            c: 'c',
            csharp: 'cs',
            go: 'go',
            rust: 'rs',
            typescript: 'ts',
            kotlin: 'kt',
            swift: 'swift',
            ruby: 'rb',
            php: 'php'
        };
        return extensions[language.toLowerCase()] || 'txt';
    }

    /**
     * Run code against multiple test cases
     * @param {string} code - Source code
     * @param {string} language - Programming language
     * @param {Array} testCases - Array of {input, expectedOutput}
     * @returns {Promise<Object>} Test results
     */
    async runTestCases(code, language, testCases) {
        // Validate language
        if (!LANGUAGE_MAP[language.toLowerCase()]) {
            return {
                totalTests: testCases.length,
                passedTests: 0,
                failedTests: testCases.length,
                allPassed: false,
                results: [],
                error: `Unsupported language: ${language}`
            };
        }

        const results = [];
        let passedCount = 0;

        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            const result = await this.executeCode(code, language, testCase.input);

            const actualOutput = result.stdout.trim();
            const expectedOutput = testCase.expectedOutput.trim();
            const passed = actualOutput === expectedOutput && result.success;

            if (passed) passedCount++;

            results.push({
                testCase: i + 1,
                input: testCase.input,
                expectedOutput: expectedOutput,
                actualOutput: actualOutput,
                passed: passed,
                error: result.error,
                time: result.time,
                memory: result.memory
            });
        }

        return {
            totalTests: testCases.length,
            passedTests: passedCount,
            failedTests: testCases.length - passedCount,
            allPassed: passedCount === testCases.length,
            results: results
        };
    }

    /**
     * Get supported languages
     */
    getSupportedLanguages() {
        return Object.keys(LANGUAGE_MAP);
    }

    /**
     * Get available Piston runtimes (for debugging)
     */
    async getRuntimes() {
        try {
            const response = await axios.get(`${PISTON_API}/runtimes`);
            return response.data;
        } catch (error) {
            console.error('[CODE EXECUTOR] Failed to fetch runtimes:', error.message);
            return [];
        }
    }
}

const codeExecutor = new CodeExecutor();
export default codeExecutor;
