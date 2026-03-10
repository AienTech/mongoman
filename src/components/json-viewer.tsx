'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JsonViewerProps {
    data: any;
    initiallyExpanded?: boolean;
    className?: string;
}

export function JsonViewer({ data, initiallyExpanded = false, className }: JsonViewerProps) {
    return (
        <div className={cn("font-mono text-[13px] bg-muted/30 p-4 rounded-md overflow-x-auto", className)}>
            <JsonNode value={data} name={null} initiallyExpanded={initiallyExpanded} isRoot isLast />
        </div>
    );
}

function JsonNode({
    value,
    name,
    initiallyExpanded,
    isRoot = false,
    isLast = true,
}: {
    value: any;
    name: string | number | null;
    initiallyExpanded: boolean;
    isRoot?: boolean;
    isLast?: boolean;
}) {
    const [expanded, setExpanded] = useState(initiallyExpanded);

    const getType = (val: any) => {
        if (val === null) return 'null';
        if (Array.isArray(val)) return 'array';
        return typeof val;
    };

    const type = getType(value);

    if (type === 'object' && value !== null) {
        if ('$oid' in value && Object.keys(value).length === 1) {
            return (
                <div className={cn("flex", !isRoot && "pl-4")}>
                    {name !== null && <span className="text-purple-600 dark:text-purple-400 mr-1 whitespace-nowrap">"{name}":</span>}
                    <span className="text-blue-600 dark:text-blue-400 whitespace-nowrap">ObjectId("{value.$oid}")</span>
                    {!isLast && <span className="text-foreground">,</span>}
                </div>
            );
        }
        if ('$date' in value && Object.keys(value).length === 1) {
            return (
                <div className={cn("flex", !isRoot && "pl-4")}>
                    {name !== null && <span className="text-purple-600 dark:text-purple-400 mr-1 whitespace-nowrap">"{name}":</span>}
                    <span className="text-green-600 dark:text-green-400 whitespace-nowrap">ISODate("{value.$date}")</span>
                    {!isLast && <span className="text-foreground">,</span>}
                </div>
            );
        }
    }

    const isExpandable = type === 'object' || type === 'array';

    if (!isExpandable) {
        let displayValue: string = String(value);
        let valueColor = 'text-foreground';

        if (type === 'string') {
            displayValue = `"${value}"`;
            valueColor = 'text-green-600 dark:text-green-400';
        } else if (type === 'number') {
            valueColor = 'text-blue-600 dark:text-blue-400';
        } else if (type === 'boolean') {
            valueColor = 'text-orange-600 dark:text-orange-400';
        } else if (type === 'null') {
            displayValue = 'null';
            valueColor = 'text-gray-500 dark:text-gray-400';
        }

        return (
            <div className={cn("flex", !isRoot && "pl-4")}>
                {name !== null && <span className="text-purple-600 dark:text-purple-400 mr-1 whitespace-nowrap">"{name}":</span>}
                <span className={cn(valueColor, "whitespace-nowrap")}>{displayValue}</span>
                {!isLast && <span className="text-foreground">,</span>}
            </div>
        );
    }

    const isArray = type === 'array';
    const openBracket = isArray ? '[' : '{';
    const closeBracket = isArray ? ']' : '}';
    const keys = Object.keys(value || {});
    const isEmpty = keys.length === 0;

    return (
        <div className={isRoot ? '' : 'pl-4'}>
            <div className="flex items-start">
                <div
                    className="flex items-center cursor-pointer select-none -ml-4 w-4 h-5"
                    onClick={() => setExpanded(!expanded)}
                >
                    {!isEmpty && (
                        expanded ? (
                            <ChevronDown className="h-3 w-3 text-muted-foreground hover:text-foreground shrink-0" />
                        ) : (
                            <ChevronRight className="h-3 w-3 text-muted-foreground hover:text-foreground shrink-0" />
                        )
                    )}
                </div>

                <div className="flex-1 cursor-pointer select-none" onClick={() => setExpanded(!expanded)}>
                    {name !== null && <span className="text-purple-600 dark:text-purple-400 mr-1 whitespace-nowrap">"{name}":</span>}
                    <span className="text-foreground">{openBracket}</span>
                    {!expanded && !isEmpty && (
                        <span className="text-muted-foreground mx-1 italic text-xs">
                            {isArray ? `... ${keys.length} items ...` : `... ${keys.length} keys ...`}
                        </span>
                    )}
                    {!expanded && <span className="text-foreground">{closeBracket}</span>}
                    {!expanded && !isLast && <span className="text-foreground">,</span>}
                </div>
            </div>

            {expanded && !isEmpty && (
                <div>
                    {keys.map((key, index) => (
                        <JsonNode
                            key={key}
                            name={isArray ? null : key}
                            value={value[key as keyof typeof value]}
                            initiallyExpanded={false}
                            isLast={index === keys.length - 1}
                        />
                    ))}
                    <div className="flex">
                        <span className="text-foreground">{closeBracket}</span>
                        {!isLast && <span className="text-foreground">,</span>}
                    </div>
                </div>
            )}
        </div>
    );
}
