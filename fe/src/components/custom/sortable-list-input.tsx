import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    horizontalListSortingStrategy,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowDown, ArrowUp, GripVertical, X } from "lucide-react";

export type SortItem = {
  label: string;
  value: string;
  order: "asc" | "desc";
};

type SortableListInputProps = {
  value: SortItem[];
  onChange: (items: SortItem[]) => void;
  availableItems: Omit<SortItem, "order">[];
};

export default function SortableListInput({
  value,
  onChange,
  availableItems,
}: SortableListInputProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const isItemSelected = (item: Omit<SortItem, "order">) => {
    return value.some((v) => v.value === item.value);
  };

  const onSortItemInsert = (item: Omit<SortItem, "order">) => {
    const newItem: SortItem = {
      ...item,
      order: "asc", // Default order
    };
    onChange([...value, newItem]);
  };

  const onSortItemDelete = (item: SortItem) => {
    const updatedItems = value.filter((v) => v.value !== item.value);
    onChange(updatedItems);
  };

  const onSortItemOrderToggle = (item: SortItem) => {
    const updatedItems = value.map((v) =>
      v.value === item.value
        ? { ...v, order: v.order === "asc" ? "desc" : "asc" }
        : v
    );
    onChange(updatedItems as SortItem[]);
  };
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = value.findIndex((item) => item.value === active.id);
      const newIndex = value.findIndex((item) => item.value === over?.id);

      onChange(arrayMove(value, oldIndex, newIndex));
    }
  };

  return (
    <div className="flex justify-center items-center gap-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={value.map((item) => item.value)}
          strategy={horizontalListSortingStrategy}
        >
          {value.map((item, index) => (
            <SortItemContainer
              key={item.value}
              item={item}
              index={index}
              onOrderToggle={() => onSortItemOrderToggle(item)}
              onRemove={() => onSortItemDelete(item)}
            />
          ))}
        </SortableContext>
      </DndContext>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="outline">Add sort field</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {availableItems.map((item) => (
            <DropdownMenuItem
              key={item.value}
              disabled={isItemSelected(item)}
              onClick={() => {
                if (isItemSelected(item)) return;
                onSortItemInsert(item);
              }}
            >
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

type SortItemContainerProps = {
  item: SortItem;
  index: number;
  onOrderToggle: (item: SortItem) => void;
  onRemove: (item: SortItem) => void;
};

function SortItemContainer({
  item,
  index,
  onOrderToggle,
  onRemove,
}: SortItemContainerProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.value });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center py-1 px-2 gap-2 border rounded-lg bg-background",
        isDragging && "border-green-500 opacity-90 z-50"
      )}
    >
      <div
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Field Label */}
      <Badge variant="secondary" className="text-xs px-2 py-1 min-w-[24px]">
        {index + 1}
      </Badge>
      <div className="flex-1 text-sm font-medium">{item.label}</div>

      {/* Order Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onOrderToggle(item)}
        className="h-6 w-6 p-0 hover:bg-muted"
      >
        {item.order === "asc" ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3" />
        )}
      </Button>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(item)}
        className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}
