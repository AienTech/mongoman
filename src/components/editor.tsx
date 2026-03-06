'use client';

import { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EJSON } from 'bson';
import { useTheme } from 'next-themes';

interface Props {
  initialValue: object;
  onChange: (newValue: object) => void;
  readOnly?: boolean;
}

const DocumentEditor = ({ onChange, initialValue, readOnly }: Props) => {
  const [error, setError] = useState<string>('');
  const { resolvedTheme } = useTheme();

  const initialValueString = JSON.stringify(initialValue, null, 2);

  return (
    <>
      <style>{`
        .json-editor .cm-string { color: ${resolvedTheme === 'dark' ? '#ce9178' : '#a31515'} !important; }
        .json-editor .cm-number { color: ${resolvedTheme === 'dark' ? '#b5cea8' : '#098658'} !important; }
        .json-editor .cm-bool { color: ${resolvedTheme === 'dark' ? '#569cd6' : '#0000ff'} !important; }
        .json-editor .cm-null { color: ${resolvedTheme === 'dark' ? '#569cd6' : '#0000ff'} !important; }
        .json-editor .cm-propertyName { color: ${resolvedTheme === 'dark' ? '#9cdcfe' : '#0451a5'} !important; }
        .json-editor .cm-punctuation { color: ${resolvedTheme === 'dark' ? '#d4d4d4' : '#383a42'} !important; }
        .json-editor .cm-content { caret-color: ${resolvedTheme === 'dark' ? '#aeafad' : '#526fff'} !important; }
        .json-editor .cm-gutters {
          background: ${resolvedTheme === 'dark' ? '#1e1e1e' : '#ffffff'} !important;
          color: ${resolvedTheme === 'dark' ? '#858585' : '#999999'} !important;
          border-right: 1px solid ${resolvedTheme === 'dark' ? '#333' : '#ddd'} !important;
        }
        .json-editor .cm-activeLine { background: ${resolvedTheme === 'dark' ? '#2a2d2e' : '#f5f5f5'} !important; }
        .json-editor .cm-activeLineGutter { background: ${resolvedTheme === 'dark' ? '#2a2d2e' : '#f5f5f5'} !important; }
      `}</style>
      <CodeMirror
        value={initialValueString}
        height='500px'
        theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
        extensions={[json()]}
        readOnly={readOnly}
        editable={!readOnly}
        onChange={(value) => {
          try {
            const parsedValue = EJSON.parse(value);

            if (typeof parsedValue !== 'object' || Array.isArray(parsedValue) || parsedValue === null) {
              setError('Input must be a valid JSON object');
              return;
            }

            setError('');
            onChange(parsedValue);
          } catch {
            setError('Invalid JSON: Please enter a valid JSON object');
          }
        }}
        className='json-editor mb-4 border rounded'
      />
      {error && (
        <Alert variant='destructive' className='mt-2'>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default DocumentEditor;
