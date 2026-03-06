'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Trash2, ChevronDown, Code, SlidersHorizontal } from 'lucide-react';

type Operator =
  | '$eq'
  | '$ne'
  | '$gt'
  | '$gte'
  | '$lt'
  | '$lte'
  | '$in'
  | '$nin'
  | '$regex'
  | '$exists';

interface QueryCondition {
  id: string;
  field: string;
  operator: Operator;
  value: string;
}

interface QueryGroup {
  id: string;
  logic: '$and' | '$or';
  conditions: QueryCondition[];
}

const OPERATORS: { value: Operator; label: string }[] = [
  { value: '$eq', label: 'equals' },
  { value: '$ne', label: 'not equals' },
  { value: '$gt', label: 'greater than' },
  { value: '$gte', label: 'greater or equal' },
  { value: '$lt', label: 'less than' },
  { value: '$lte', label: 'less or equal' },
  { value: '$in', label: 'in array' },
  { value: '$nin', label: 'not in array' },
  { value: '$regex', label: 'matches regex' },
  { value: '$exists', label: 'exists' },
];

function parseValue(value: string): unknown {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;
  const num = Number(value);
  if (!isNaN(num) && value.trim() !== '') return num;
  // Check for array syntax (for $in/$nin)
  if (value.startsWith('[') && value.endsWith(']')) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

function buildQuery(groups: QueryGroup[]): object {
  if (groups.length === 0) return {};
  if (groups.length === 1 && groups[0].conditions.length === 0) return {};

  const groupQueries = groups
    .filter((g) => g.conditions.length > 0)
    .map((group) => {
      const conditions = group.conditions.map((c) => {
        if (c.operator === '$eq') {
          return { [c.field]: parseValue(c.value) };
        }
        if (c.operator === '$exists') {
          return { [c.field]: { $exists: c.value !== 'false' } };
        }
        return { [c.field]: { [c.operator]: parseValue(c.value) } };
      });

      if (conditions.length === 1) return conditions[0];
      return { [group.logic]: conditions };
    });

  if (groupQueries.length === 0) return {};
  if (groupQueries.length === 1) return groupQueries[0];
  return { $and: groupQueries };
}

function uid() {
  return `qb-${crypto.randomUUID()}`;
}

interface QueryBuilderProps {
  fields: string[];
  onQueryChange: (query: string) => void;
  initialQuery?: string;
}

export function QueryBuilder({ fields, onQueryChange, initialQuery }: QueryBuilderProps) {
  const [mode, setMode] = useState<'visual' | 'raw'>(initialQuery ? 'raw' : 'visual');
  const [rawQuery, setRawQuery] = useState(initialQuery || '');
  const [groups, setGroups] = useState<QueryGroup[]>([
    { id: uid(), logic: '$and', conditions: [] },
  ]);

  const addCondition = useCallback((groupId: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, conditions: [...g.conditions, { id: uid(), field: '', operator: '$eq', value: '' }] }
          : g,
      ),
    );
  }, []);

  const removeCondition = useCallback((groupId: string, conditionId: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, conditions: g.conditions.filter((c) => c.id !== conditionId) } : g,
      ),
    );
  }, []);

  const updateCondition = useCallback(
    (groupId: string, conditionId: string, updates: Partial<QueryCondition>) => {
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? { ...g, conditions: g.conditions.map((c) => (c.id === conditionId ? { ...c, ...updates } : c)) }
            : g,
        ),
      );
    },
    [],
  );

  const toggleGroupLogic = useCallback((groupId: string) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, logic: g.logic === '$and' ? '$or' : '$and' } : g)),
    );
  }, []);

  const addGroup = useCallback(() => {
    setGroups((prev) => [...prev, { id: uid(), logic: '$and', conditions: [] }]);
  }, []);

  const removeGroup = useCallback((groupId: string) => {
    setGroups((prev) => {
      const filtered = prev.filter((g) => g.id !== groupId);
      return filtered.length === 0 ? [{ id: uid(), logic: '$and' as const, conditions: [] }] : filtered;
    });
  }, []);

  const applyVisualQuery = useCallback(() => {
    const query = buildQuery(groups);
    const queryStr = Object.keys(query).length > 0 ? JSON.stringify(query) : '';
    onQueryChange(queryStr);
  }, [groups, onQueryChange]);

  const applyRawQuery = useCallback(() => {
    onQueryChange(rawQuery);
  }, [rawQuery, onQueryChange]);

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between pb-3'>
        <CardTitle className='text-sm font-medium'>Query Filter</CardTitle>
        <div className='flex gap-1'>
          <Button
            variant={mode === 'visual' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setMode('visual')}
          >
            <SlidersHorizontal className='mr-1 h-3 w-3' />
            Visual
          </Button>
          <Button
            variant={mode === 'raw' ? 'default' : 'outline'}
            size='sm'
            onClick={() => {
              if (mode === 'visual') {
                const query = buildQuery(groups);
                setRawQuery(Object.keys(query).length > 0 ? JSON.stringify(query, null, 2) : '');
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
          <div className='space-y-2'>
            <Input
              placeholder="{'field': 'value'}"
              className='font-mono'
              value={rawQuery}
              onChange={(e) => setRawQuery(e.target.value)}
            />
            <Button size='sm' onClick={applyRawQuery}>
              Apply Filter
            </Button>
          </div>
        ) : (
          <div className='space-y-3'>
            {groups.map((group, groupIndex) => (
              <div key={group.id} className='rounded-md border p-3 space-y-2'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    {groupIndex > 0 && (
                      <span className='text-xs text-muted-foreground uppercase font-medium'>AND</span>
                    )}
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => toggleGroupLogic(group.id)}
                      className='h-6 text-xs'
                    >
                      {group.logic === '$and' ? 'Match ALL' : 'Match ANY'}
                    </Button>
                  </div>
                  <div className='flex gap-1'>
                    <Button variant='ghost' size='sm' onClick={() => addCondition(group.id)} className='h-6'>
                      <Plus className='h-3 w-3' />
                    </Button>
                    {groups.length > 1 && (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => removeGroup(group.id)}
                        className='h-6 text-destructive'
                      >
                        <Trash2 className='h-3 w-3' />
                      </Button>
                    )}
                  </div>
                </div>

                {group.conditions.map((condition) => (
                  <div key={condition.id} className='flex items-center gap-2'>
                    {/* Field selector */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='outline' size='sm' className='min-w-[120px] justify-between'>
                          {condition.field || 'Field'}
                          <ChevronDown className='ml-1 h-3 w-3' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className='max-h-60 overflow-auto'>
                        {fields.map((f) => (
                          <DropdownMenuItem
                            key={f}
                            onClick={() => updateCondition(group.id, condition.id, { field: f })}
                          >
                            {f}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuItem
                          onClick={() => updateCondition(group.id, condition.id, { field: '' })}
                        >
                          <span className='italic text-muted-foreground'>Custom...</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Custom field input if empty */}
                    {!fields.includes(condition.field) && (
                      <Input
                        placeholder='field name'
                        value={condition.field}
                        onChange={(e) =>
                          updateCondition(group.id, condition.id, { field: e.target.value })
                        }
                        className='w-[120px] h-8'
                      />
                    )}

                    {/* Operator selector */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='outline' size='sm' className='min-w-[130px] justify-between'>
                          {OPERATORS.find((o) => o.value === condition.operator)?.label || condition.operator}
                          <ChevronDown className='ml-1 h-3 w-3' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {OPERATORS.map((op) => (
                          <DropdownMenuItem
                            key={op.value}
                            onClick={() =>
                              updateCondition(group.id, condition.id, { operator: op.value })
                            }
                          >
                            {op.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Value input */}
                    <Input
                      placeholder='value'
                      value={condition.value}
                      onChange={(e) =>
                        updateCondition(group.id, condition.id, { value: e.target.value })
                      }
                      className='flex-1 h-8'
                    />

                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => removeCondition(group.id, condition.id)}
                      className='h-8 text-destructive'
                    >
                      <Trash2 className='h-3 w-3' />
                    </Button>
                  </div>
                ))}

                {group.conditions.length === 0 && (
                  <Button
                    variant='outline'
                    size='sm'
                    className='w-full border-dashed'
                    onClick={() => addCondition(group.id)}
                  >
                    <Plus className='mr-1 h-3 w-3' />
                    Add condition
                  </Button>
                )}
              </div>
            ))}

            <div className='flex gap-2'>
              <Button variant='outline' size='sm' onClick={addGroup} className='border-dashed'>
                <Plus className='mr-1 h-3 w-3' />
                Add group
              </Button>
              <Button size='sm' onClick={applyVisualQuery}>
                Apply Filter
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
