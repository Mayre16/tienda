"use client";

import { Fragment, type ReactNode } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Pencil,
  Plus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { PageMediaBlockView } from "@/components/cms/PageMediaBlockView";
import {
  blockKindLabel,
  getSectionBlocks,
  pageMediaBlockSelectedId,
} from "@/lib/cms/page-media";
import type { CmsPageMediaBlock, CmsPageMediaBlockKind } from "@/lib/cms/types";
import type { PageMediaCmsEditContextValue } from "@/components/cms/PageMediaCmsContext";

const BLOCK_KINDS: CmsPageMediaBlockKind[] = [
  "text",
  "media",
  "gallery",
  "button",
];

function InsertBlockBar({
  onInsert,
}: {
  onInsert: (kind: CmsPageMediaBlockKind) => void;
}) {
  return (
    <div className="border-y border-dashed border-amber-200/80 bg-amber-50/40 py-2">
      <div className="flex flex-wrap items-center justify-center gap-1.5 px-2">
        <span className="text-[10px] font-bold uppercase tracking-wide text-amber-900/70">
          + Bloque:
        </span>
        {BLOCK_KINDS.map((kind) => (
          <button
            key={kind}
            type="button"
            onClick={() => onInsert(kind)}
            className="inline-flex items-center gap-1 rounded-full border border-amber-300/80 bg-white px-2.5 py-1 text-[10px] font-bold uppercase text-amber-950 hover:bg-amber-50"
          >
            <Plus className="h-3 w-3" />
            {blockKindLabel(kind)}
          </button>
        ))}
      </div>
    </div>
  );
}

function SortableBlockRow({
  block,
  index,
  sectionId,
  total,
  editing,
  edit,
}: {
  block: CmsPageMediaBlock;
  index: number;
  sectionId: string;
  total: number;
  editing: boolean;
  edit: PageMediaCmsEditContextValue;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id, disabled: !editing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? "z-20" : ""}`}
    >
      {editing ? (
        <div className="absolute left-0 top-2 z-10 flex flex-col gap-1 sm:left-2">
          <button
            type="button"
            className="cursor-grab rounded-full border border-slate-300 bg-white p-1.5 text-slate-600 shadow active:cursor-grabbing"
            aria-label="Arrastrar bloque"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={index === 0}
            onClick={() => edit.moveBlockUp(sectionId, block.id)}
            className="rounded-full border border-slate-300 bg-white p-1 text-slate-600 shadow disabled:opacity-40"
            aria-label="Subir bloque"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={index >= total - 1}
            onClick={() => edit.moveBlockDown(sectionId, block.id)}
            className="rounded-full border border-slate-300 bg-white p-1 text-slate-600 shadow disabled:opacity-40"
            aria-label="Bajar bloque"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() =>
              edit.setSelectedId(pageMediaBlockSelectedId(sectionId, block.id))
            }
            className="rounded-full bg-na-helios p-1.5 text-na-ink shadow"
            aria-label="Editar bloque"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}
      <div className={editing ? "pl-10 sm:pl-12" : ""}>
        <PageMediaBlockView block={block} index={index} />
      </div>
    </div>
  );
}

export function PageMediaSortableBlocks({
  sectionId,
  blocks,
  editing,
  edit,
}: {
  sectionId: string;
  blocks: CmsPageMediaBlock[];
  editing: boolean;
  edit: PageMediaCmsEditContextValue | null;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function onDragEnd(event: DragEndEvent) {
    if (!edit) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    edit.reorderBlocks(sectionId, String(active.id), String(over.id));
  }

  function insertAt(index: number, kind: CmsPageMediaBlockKind) {
    if (!edit) return;
    const id = edit.insertBlockAt(sectionId, index, kind);
    edit.setSelectedId(pageMediaBlockSelectedId(sectionId, id));
  }

  if (blocks.length === 0 && !editing) return null;

  const list: ReactNode[] = [];

  if (editing && edit) {
    list.push(
      <InsertBlockBar key="insert-0" onInsert={(kind) => insertAt(0, kind)} />,
    );
  }

  blocks.forEach((block, index) => {
    list.push(
      <Fragment key={block.id}>
        {editing && edit ? (
          <SortableBlockRow
            block={block}
            index={index}
            sectionId={sectionId}
            total={blocks.length}
            editing={editing}
            edit={edit}
          />
        ) : (
          <PageMediaBlockView block={block} index={index} />
        )}
        {editing && edit ? (
          <InsertBlockBar
            key={`insert-${index + 1}`}
            onInsert={(kind) => insertAt(index + 1, kind)}
          />
        ) : null}
      </Fragment>,
    );
  });

  if (!editing || !edit) {
    return <div className="space-y-8">{list}</div>;
  }

  if (blocks.length === 0) {
    return (
      <div className="space-y-3">
        {list}
        <p className="text-center text-sm font-semibold text-amber-800">
          Elija un tipo de bloque arriba para empezar.
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-6">{list}</div>
      </SortableContext>
    </DndContext>
  );
}
