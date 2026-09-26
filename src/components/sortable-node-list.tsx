"use client";

import {
  Children,
  type ReactNode,
} from "react";
import { DragDropProvider } from "@dnd-kit/react";
import {
  isSortable,
  useSortable,
} from "@dnd-kit/react/sortable";

type SortableNodeListProps = {
  nodeIds: string[];
  reorderAction: (
    activeNodeId: string,
    targetIndex: number,
  ) => Promise<void>;
  children: ReactNode;
};

type SortableNodeProps = {
  id: string;
  index: number;
  children: ReactNode;
};

function SortableNode({
  id,
  index,
  children,
}: SortableNodeProps) {
  const {
    ref,
    handleRef,
    isDragSource,
  } = useSortable({
    id,
    index,
  });

  return (
    <div
      ref={ref}
      className={`flex items-start gap-2 rounded border p-2 ${
        isDragSource ? "opacity-60" : ""
      }`}
    >
      <button
        ref={handleRef}
        type="button"
        aria-label="Drag to reorder node"
        title="Drag to reorder"
        className="cursor-grab rounded border px-2 py-1 active:cursor-grabbing"
      >
        ⋮⋮
      </button>

      <div className="min-w-0 flex-1">
        {children}
      </div>
    </div>
  );
}

export function SortableNodeList({
  nodeIds,
  reorderAction,
  children,
}: SortableNodeListProps) {
  const childItems = Children.toArray(children);

  return (
    <DragDropProvider
      onDragEnd={async (event) => {
        if (event.canceled) {
          return;
        }

        const { source } = event.operation;

        if (!isSortable(source)) {
          return;
        }

        const { initialIndex, index } = source;

        if (initialIndex === index) {
          return;
        }

        await reorderAction(String(source.id), index);
      }}
    >
      <div className="space-y-3">
        {nodeIds.map((id, index) => (
          <SortableNode
            key={id}
            id={id}
            index={index}
          >
            {childItems[index]}
          </SortableNode>
        ))}
      </div>
    </DragDropProvider>
  );
}