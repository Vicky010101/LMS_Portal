import React from 'react';
import Editor from '@monaco-editor/react';

const STARTER_CODE = {
    python: `# Write your solution here
def solution():
    pass

# Read input
import sys
input_data = sys.stdin.read().strip()
print(solution())
`,
    javascript: `// Write your solution here
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
let lines = [];
rl.on('line', line => lines.push(line.trim()));
rl.on('close', () => {
    // Your solution here
    console.log("Hello World");
});
`,
    java: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws Exception {
        Scanner sc = new Scanner(System.in);
        // Write your solution here
        System.out.println("Hello World");
    }
}
`,
    cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    // Write your solution here
    cout << "Hello World" << endl;
    return 0;
}
`,
};

const LANG_LABELS = {
    python: '🐍 Python 3',
    javascript: '🟨 JavaScript',
    java: '☕ Java',
    cpp: '⚙️ C++',
};

const MONACO_LANG = { python: 'python', javascript: 'javascript', java: 'java', cpp: 'cpp' };

export default function CodeEditor({ code, language, onCodeChange, onLanguageChange, onRun, onSubmit, isRunning, isSubmitting }) {
    const handleLangChange = (lang) => {
        onLanguageChange(lang);
        // Only reset if code is empty or still default
        onCodeChange(STARTER_CODE[lang] || '');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#1E1E1E' }}>
            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', background: '#252526', borderBottom: '1px solid #3C3C3C', flexShrink: 0, flexWrap: 'wrap' }}>
                {/* Language Selector */}
                <select value={language} onChange={e => handleLangChange(e.target.value)}
                    style={{ padding: '5px 10px', background: '#3C3C3C', color: '#D4D4D4', border: '1px solid #555', borderRadius: 6, fontSize: 13, outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                    {Object.entries(LANG_LABELS).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                    ))}
                </select>

                <div style={{ flex: 1 }} />

                {/* Reset Button */}
                <button onClick={() => onCodeChange(STARTER_CODE[language] || '')}
                    style={{ padding: '5px 12px', background: 'transparent', color: '#9CDCFE', border: '1px solid #555', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                    ↺ Reset
                </button>

                {/* Run Button */}
                <button onClick={onRun} disabled={isRunning}
                    style={{ padding: '6px 18px', background: isRunning ? '#1a5c2e' : '#22C55E', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: isRunning ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit', transition: 'background 0.2s' }}>
                    {isRunning ? <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span> Running...</> : '▶ Run'}
                </button>

                {/* Submit Button */}
                <button onClick={onSubmit} disabled={isSubmitting}
                    style={{ padding: '6px 18px', background: isSubmitting ? '#312e81' : '#4F46E5', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit', transition: 'background 0.2s' }}>
                    {isSubmitting ? <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span> Submitting...</> : '🚀 Submit'}
                </button>
            </div>

            {/* Monaco Editor */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
                <Editor
                    height="100%"
                    language={MONACO_LANG[language]}
                    value={code}
                    onChange={val => onCodeChange(val || '')}
                    theme="vs-dark"
                    options={{
                        fontSize: 14,
                        fontFamily: "'Cascadia Code', 'Fira Code', 'Courier New', monospace",
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        padding: { top: 12, bottom: 12 },
                        lineNumbers: 'on',
                        renderLineHighlight: 'all',
                        bracketPairColorization: { enabled: true },
                        autoIndent: 'full',
                        formatOnPaste: true,
                        tabSize: 4,
                        wordWrap: 'on',
                        suggestOnTriggerCharacters: true,
                    }}
                />
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

export { STARTER_CODE };
