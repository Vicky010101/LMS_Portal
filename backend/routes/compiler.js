const express = require('express');
const router = express.Router();
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const LANG_CONFIG = {
    python: { ext: 'py', file: 'main.py' },
    javascript: { ext: 'js', file: 'main.js' },
    java: { ext: 'java', file: 'Main.java' },
    cpp: { ext: 'cpp', file: 'main.cpp' },
};

function runCode(code, language, stdin = '') {
    const config = LANG_CONFIG[language];
    if (!config) throw new Error(`Unsupported language: ${language}`);

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lms-'));
    const filePath = path.join(tmpDir, config.file);
    const stdinFile = path.join(tmpDir, 'stdin.txt');

    try {
        fs.writeFileSync(filePath, code, 'utf8');
        fs.writeFileSync(stdinFile, stdin || '', 'utf8');

        const opts = { timeout: 8000, maxBuffer: 512 * 1024, cwd: tmpDir };
        const start = Date.now();
        let stdout = '';

        if (language === 'python') {
            stdout = execSync(`python "${filePath}" < "${stdinFile}"`, opts).toString();
        } else if (language === 'javascript') {
            stdout = execSync(`node "${filePath}" < "${stdinFile}"`, opts).toString();
        } else if (language === 'java') {
            execSync(`javac "${filePath}"`, opts);
            stdout = execSync(`java -cp "${tmpDir}" Main < "${stdinFile}"`, opts).toString();
        } else if (language === 'cpp') {
            const outFile = path.join(tmpDir, 'main.exe');
            execSync(`g++ "${filePath}" -o "${outFile}"`, opts);
            stdout = execSync(`"${outFile}" < "${stdinFile}"`, opts).toString();
        }

        const elapsed = Date.now() - start;
        return { output: stdout.trim() || '(no output)', status: 'Success', isError: false, executionTime: `${elapsed}ms` };
    } catch (err) {
        const msg = err.stderr?.toString() || err.stdout?.toString() || err.message || 'Unknown error';
        const isCompile = msg.includes('error:') || msg.includes('SyntaxError') || msg.includes('javac');
        return {
            output: msg.trim(),
            status: isCompile ? 'Compilation Error' : 'Runtime Error',
            isError: true,
            executionTime: null,
        };
    } finally {
        try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { }
    }
}

// Single run with custom stdin
router.post('/run', (req, res) => {
    const { code, language, stdin = '' } = req.body;
    try {
        const result = runCode(code, language, stdin);
        res.json(result);
    } catch (err) {
        res.status(400).json({ output: err.message, status: 'Error', isError: true });
    }
});

// Run against multiple test cases
router.post('/run-tests', (req, res) => {
    const { code, language, testCases = [] } = req.body;
    const results = testCases.map((tc, i) => {
        const result = runCode(code, language, tc.input || '');
        const actual = result.output.trim();
        const expected = (tc.expectedOutput || '').trim();
        const passed = !result.isError && actual === expected;
        return {
            index: i,
            input: tc.input || '',
            expectedOutput: expected,
            actualOutput: actual,
            passed,
            status: result.isError ? result.status : (passed ? 'Passed' : 'Wrong Answer'),
            executionTime: result.executionTime,
            isError: result.isError,
        };
    });

    const passed = results.filter(r => r.passed).length;
    res.json({ results, passed, total: testCases.length });
});

module.exports = router;
