'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, ChevronDown, ChevronUp, Play, Code, SlidersHorizontal } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { useTheme } from 'next-themes';

const STAGE_TYPES = [
  { value: '$match', label: '$match', description: 'Filter documents' },
  { value: '$group', label: '$group', description: 'Group by field' },
  { value: '$project', label: '$project', description: 'Select fields' },
  { value: '$sort', label: '$sort', description: 'Sort documents' },
  { value: '$limit', label: '$limit', description: 'Limit results' },
  { value: '$skip', label: '$skip', description: 'Skip documents' },
  { value: '$unwind', label: '$unwind', description: 'Deconstruct array' },
  { value: '$lookup', label: '$lookup', description: 'Join collections' },
  { value: '$addFields', label: '$addFields', description: 'Add new fields' },
  { value: '$count', label: '$count', description: 'Count documents' },
  { value: '$out', label: '$out', description: 'Write to collection' },
] as const;

const STAGE_TEMPLATES: Record<string, string> = {
  $match: '{\n  "field": "value"\n}',
  $group: '{\n  "_id": "$field",\n  "count": { "$sum": 1 }\n}',
  $project: '{\n  "field1": 1,\n  "field2": 1,\n  "_id": 0\n}',
  $sort: '{\n  "field": 1\n}',
  $limit: '10',
  $skip: '0',
  $unwind: '"$arrayField"',
  $lookup: '{\n  "from": "otherCollection",\n  "localField": "field",\n  "foreignField": "field",\n  "as": "joined"\n}',
  $addFields: '{\n  "newField": { "$concat": ["$field1", " ", "$field2"] }\n}',
  $count: '"totalCount"',
  $out: '"outputCollection"',
};

interface PipelineStage {
  id: string;
  type: string;
  value: string;
  enabled: boolean;
}

function stageId() {
  return `stage-${crypto.randomUUID()}`;
}

interface AggregationPipelineProps {
  databaseName: string;
  collectionName: string;
  runAggregation: (dbName: string, collectionName: string, pipeline: object[]) => Promise<object[]>;
}

export function AggregationPipeline({
  databaseName,
  collectionName,
  runAggregation,
}: AggregationPipelineProps) {
  const { resolvedTheme } = useTheme();
  const [mode, setMode] = useState<'visual' | 'raw'>('visual');
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [rawPipeline, setRawPipeline] = useState('[\n  \n]');
  const [results, setResults] = useState<object[] | null>(null);
  const [error, setError] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const addStage = useCallback((type: string) => {
    setStages((prev) => [
      ...prev,
      { id: stageId(), type, value: STAGE_TEMPLATES[type] || '{}', enabled: true },
    ]);
  }, []);

  const removeStage = useCallback((id: string) => {
    setStages((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const updateStage = useCallback((id: string, updates: Partial<PipelineStage>) => {
    setStages((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  }, []);

  const moveStage = useCallback((id: string, direction: 'up' | 'down') => {
    setStages((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx === -1) return prev;
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
      return copy;
    });
  }, []);

  const buildPipeline = useCallback((): object[] | null => {
    if (mode === 'raw') {
      try {
        const parsed = JSON.parse(rawPipeline);
        if (!Array.isArray(parsed)) {
          setError('Pipeline must be a JSON array');
          return null;
        }
        return parsed;
      } catch {
        setError('Invalid JSON in pipeline');
        return null;
      }
    }

    try {
      return stages
        .filter((s) => s.enabled)
        .map((s) => {
          let parsed: unknown;
          try {
            parsed = JSON.parse(s.value);
          } catch {
            // Try wrapping in braces for simple values
            parsed = JSON.parse(`${s.value}`);
          }
          return { [s.type]: parsed };
        });
    } catch (e) {
      setError(`Invalid stage value: ${e instanceof Error ? e.message : 'parse error'}`);
      return null;
    }
  }, [mode, rawPipeline, stages]);

  const handleRun = useCallback(async () => {
    setError('');
    setResults(null);
    const pipeline = buildPipeline();
    if (!pipeline) return;

    setIsRunning(true);
    try {
      const res = await runAggregation(databaseName, collectionName, pipeline);
      setResults(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Aggregation failed');
    } finally {
      setIsRunning(false);
    }
  }, [buildPipeline, runAggregation, databaseName, collectionName]);

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-3'>
          <CardTitle>Aggregation Pipeline</CardTitle>
          <div className='flex gap-1'>
            <Button
              variant={mode === 'visual' ? 'default' : 'outline'}
              size='sm'
              onClick={() => {
                if (mode === 'raw' && stages.length > 0) {
                  // switching back to visual
                }
                setMode('visual');
              }}
            >
              <SlidersHorizontal className='mr-1 h-3 w-3' />
              Visual
            </Button>
            <Button
              variant={mode === 'raw' ? 'default' : 'outline'}
              size='sm'
              onClick={() => {
                if (mode === 'visual' && stages.length > 0) {
                  const pipeline = stages
                    .filter((s) => s.enabled)
                    .map((s) => {
                      try {
                        return { [s.type]: JSON.parse(s.value) };
                      } catch {
                        return { [s.type]: s.value };
                      }
                    });
                  setRawPipeline(JSON.stringify(pipeline, null, 2));
                }
                setMode('raw');
              }}
            >
              <Code className='mr-1 h-3 w-3' />
              JSON
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {mode === 'raw' ? (
            <div className='space-y-3'>
              <CodeMirror
                value={rawPipeline}
                height='300px'
                theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
                extensions={[json()]}
                onChange={(value) => setRawPipeline(value)}
                className='border rounded'
              />
            </div>
          ) : (
            <div className='space-y-3'>
              {stages.map((stage, index) => (
                <div key={stage.id} className='rounded-md border p-3 space-y-2'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <span className='text-xs font-mono bg-primary/10 px-2 py-0.5 rounded'>
                        {index + 1}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='outline' size='sm' className='h-7'>
                            {stage.type}
                            <ChevronDown className='ml-1 h-3 w-3' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {STAGE_TYPES.map((st) => (
                            <DropdownMenuItem
                              key={st.value}
                              onClick={() => updateStage(stage.id, { type: st.value, value: STAGE_TEMPLATES[st.value] || '{}' })}
                            >
                              <span className='font-mono text-xs'>{st.label}</span>
                              <span className='ml-2 text-xs text-muted-foreground'>{st.description}</span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Label className='flex items-center gap-2 text-xs'>
                        <Checkbox
                          checked={stage.enabled}
                          onCheckedChange={(checked) => updateStage(stage.id, { enabled: !!checked })}
                        />
                        Enabled
                      </Label>
                    </div>
                    <div className='flex gap-1'>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-6 w-6 p-0'
                        onClick={() => moveStage(stage.id, 'up')}
                        disabled={index === 0}
                      >
                        <ChevronUp className='h-3 w-3' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-6 w-6 p-0'
                        onClick={() => moveStage(stage.id, 'down')}
                        disabled={index === stages.length - 1}
                      >
                        <ChevronDown className='h-3 w-3' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-6 w-6 p-0 text-destructive'
                        onClick={() => removeStage(stage.id)}
                      >
                        <Trash2 className='h-3 w-3' />
                      </Button>
                    </div>
                  </div>
                  <CodeMirror
                    value={stage.value}
                    height='80px'
                    theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
                    extensions={[json()]}
                    onChange={(value) => updateStage(stage.id, { value })}
                    className='border rounded'
                    editable={stage.enabled}
                  />
                </div>
              ))}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' size='sm' className='w-full border-dashed'>
                    <Plus className='mr-1 h-3 w-3' />
                    Add Stage
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-56'>
                  {STAGE_TYPES.map((st) => (
                    <DropdownMenuItem key={st.value} onClick={() => addStage(st.value)}>
                      <span className='font-mono text-xs'>{st.label}</span>
                      <span className='ml-2 text-xs text-muted-foreground'>{st.description}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          <div className='mt-4'>
            <Button onClick={handleRun} disabled={isRunning}>
              <Play className='mr-2 h-4 w-4' />
              {isRunning ? 'Running...' : 'Run Pipeline'}
            </Button>
          </div>

          {error && (
            <Alert variant='destructive' className='mt-3'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {results !== null && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              <span>Results ({results.length} documents)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CodeMirror
              value={JSON.stringify(results, null, 2)}
              height='400px'
              theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
              extensions={[json()]}
              readOnly
              className='border rounded'
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
