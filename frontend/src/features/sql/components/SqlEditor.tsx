import { memo, useRef, useCallback, useState } from 'react';
import Editor, { OnMount, OnChange, loader } from '@monaco-editor/react';

loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs',
  },
});

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  onMount?: (editor: any, monaco: any) => void;
  fontSize?: number;
  minimap?: boolean;
  className?: string;
}

function FallbackEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        height: '100%',
        background: '#1e1e1e',
        color: '#d4d4d4',
        border: 'none',
        outline: 'none',
        resize: 'none',
        fontFamily: "'JetBrains Mono', 'SFMono-Regular', Menlo, monospace",
        fontSize: 14,
        padding: 12,
        lineHeight: 1.6,
        tabSize: 2,
      }}
      placeholder="Type SQL here... (Monaco editor loading)"
      spellCheck={false}
    />
  );
}

export const SqlEditor = memo(function SqlEditor({
  value, onChange, onMount, fontSize = 14, minimap = true, className,
}: SqlEditorProps) {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const [loadError, setLoadError] = useState(false);

  const handleMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    monaco.languages.registerCompletionItemProvider('sql', {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };
        const suggestions = [
          ...['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'UNION', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP', 'DISTINCT', 'AS', 'ON', 'AND', 'OR', 'IN', 'NOT', 'NULL', 'IS', 'BETWEEN', 'LIKE', 'COUNT', 'AVG', 'SUM', 'MIN', 'MAX', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'EXISTS', 'INNER', 'OUTER', 'CROSS', 'INDEX', 'TABLE', 'VIEW', 'WITH', 'RECURSIVE', 'CAST', 'COALESCE', 'NULLIF', 'ROW_NUMBER', 'RANK', 'DENSE_RANK', 'LEAD', 'LAG', 'FIRST_VALUE', 'LAST_VALUE', 'OVER', 'PARTITION BY', 'WINDOW'].map((kw) => ({
            label: kw, kind: monaco.languages.CompletionItemKind.Keyword, insertText: kw, range,
          })),
        ];
        return { suggestions };
      },
    });

    editor.addAction({
      id: 'run-query',
      label: 'Run Query',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: () => {
        editor.getAction('editor.action.executeCommand')?.run();
      },
    });

    if (onMount) onMount(editor, monaco);
  }, [onMount]);

  const handleChange: OnChange = useCallback((val) => {
    if (val !== undefined) onChange(val);
  }, [onChange]);

  if (loadError) {
    return (
      <div className={className} style={{ height: '100%' }}>
        <FallbackEditor value={value} onChange={onChange} />
      </div>
    );
  }

  return (
    <div className={className} style={{ height: '100%' }}>
      <Editor
        height="100%"
        defaultLanguage="sql"
        theme="vs-dark"
        value={value}
        onChange={handleChange}
        onMount={handleMount}
        beforeMount={() => {}}
        onValidate={() => {}}
        loading={
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '100%', background: '#1e1e1e', color: '#888', fontSize: 13,
          }}>
            Loading editor...
          </div>
        }
        onError={() => setLoadError(true)}
        options={{
          fontSize,
          fontFamily: "'JetBrains Mono', 'SFMono-Regular', Menlo, monospace",
          lineNumbers: 'on',
          minimap: { enabled: minimap },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          tabSize: 2,
          insertSpaces: true,
          automaticLayout: true,
          bracketPairColorization: { enabled: true },
          matchBrackets: 'always',
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          formatOnPaste: true,
          folding: true,
          foldingStrategy: 'indentation',
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          parameterHints: { enabled: true },
          snippetSuggestions: 'inline',
          codeLens: true,
          contextmenu: true,
          mouseWheelZoom: true,
          multiCursorModifier: 'alt',
          renderWhitespace: 'selection',
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          find: { addExtraSpaceOnTop: false, autoFindInSelection: 'never' },
          padding: { top: 12, bottom: 12 },
          overviewRulerBorder: false,
          hideCursorInOverviewRuler: true,
          renderLineHighlight: 'line',
          selectionHighlight: true,
          occurrencesHighlight: 'singleFile',
          roundedSelection: true,
        }}
      />
    </div>
  );
});
