"use client";
import { useEditor, EditorContent, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "@tiptap/markdown";
import { Table, TableRow, TableHeader, TableCell } from "@tiptap/extension-table";
import { Bold, Italic, Heading3, List, ListOrdered, Table as TableIcon, Undo2, Redo2, Rows3, Columns3, Trash2, Minus, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

/** Editor visual (tipo Word) que lee y guarda Markdown, para que el resto del sistema no cambie. */
export function EditorVisual({ markdown, onChange }: { markdown: string; onChange: (md: string) => void }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, Markdown, Table.configure({ resizable: false }), TableRow, TableHeader, TableCell],
    content: markdown.replace(/&nbsp;/g, " "),
    contentType: "markdown",
    editorProps: { attributes: { class: "prose-doc editor-visual min-h-64 rounded-b-lg border border-t-0 px-4 py-3 outline-none focus-visible:ring-3 focus-visible:ring-ring/30" } },
    onUpdate: ({ editor }) => onChange(editor.getMarkdown()),
  });
  if (!editor) return <div className="min-h-64 rounded-lg border bg-muted/30" />;
  return (
    <div>
      <BarraHerramientas editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function Boton({ etiqueta, onClick, children, disabled }: { etiqueta: string; onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <Button type="button" variant="ghost" size="icon-sm" aria-label={etiqueta} disabled={disabled} onClick={onClick}>{children}</Button>
  );
}

function Marca({ etiqueta, activo, onClick, children }: { etiqueta: string; activo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<Toggle size="sm" aria-label={etiqueta} pressed={activo} onPressedChange={onClick} />}>{children}</TooltipTrigger>
      <TooltipContent>{etiqueta}</TooltipContent>
    </Tooltip>
  );
}

function BarraHerramientas({ editor }: { editor: Editor }) {
  const e = useEditorState({
    editor,
    selector: ({ editor: ed }) => ({
      bold: ed.isActive("bold"), italic: ed.isActive("italic"), h3: ed.isActive("heading", { level: 3 }),
      ul: ed.isActive("bulletList"), ol: ed.isActive("orderedList"), quote: ed.isActive("blockquote"), enTabla: ed.isActive("table"),
      undo: ed.can().undo(), redo: ed.can().redo(),
    }),
  });
  const c = () => editor.chain().focus();
  return (
    <div className="flex flex-wrap items-center gap-0.5 rounded-t-lg border bg-muted/40 px-1.5 py-1 sticky top-12 z-[1]">
      <Boton etiqueta="Deshacer" disabled={!e.undo} onClick={() => c().undo().run()}><Undo2 /></Boton>
      <Boton etiqueta="Rehacer" disabled={!e.redo} onClick={() => c().redo().run()}><Redo2 /></Boton>
      <Separator orientation="vertical" className="mx-1 data-vertical:h-5" />
      <Marca etiqueta="Negrita" activo={e.bold} onClick={() => c().toggleBold().run()}><Bold /></Marca>
      <Marca etiqueta="Cursiva" activo={e.italic} onClick={() => c().toggleItalic().run()}><Italic /></Marca>
      <Marca etiqueta="Subtítulo" activo={e.h3} onClick={() => c().toggleHeading({ level: 3 }).run()}><Heading3 /></Marca>
      <Separator orientation="vertical" className="mx-1 data-vertical:h-5" />
      <Marca etiqueta="Lista con viñetas" activo={e.ul} onClick={() => c().toggleBulletList().run()}><List /></Marca>
      <Marca etiqueta="Lista numerada" activo={e.ol} onClick={() => c().toggleOrderedList().run()}><ListOrdered /></Marca>
      <Marca etiqueta="Nota destacada" activo={e.quote} onClick={() => c().toggleBlockquote().run()}><Quote /></Marca>
      <Boton etiqueta="Línea para firma" onClick={() => c().setHorizontalRule().run()}><Minus /></Boton>
      <Separator orientation="vertical" className="mx-1 data-vertical:h-5" />
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button type="button" variant={e.enTabla ? "secondary" : "ghost"} size="sm" />}><TableIcon /> Tabla</DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Tabla</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => c().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><TableIcon /> Insertar tabla 3 × 3</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem disabled={!e.enTabla} onClick={() => c().addRowAfter().run()}><Rows3 /> Agregar fila debajo</DropdownMenuItem>
            <DropdownMenuItem disabled={!e.enTabla} onClick={() => c().addRowBefore().run()}><Rows3 /> Agregar fila arriba</DropdownMenuItem>
            <DropdownMenuItem disabled={!e.enTabla} onClick={() => c().addColumnAfter().run()}><Columns3 /> Agregar columna a la derecha</DropdownMenuItem>
            <DropdownMenuItem disabled={!e.enTabla} onClick={() => c().deleteRow().run()}><Trash2 /> Quitar fila</DropdownMenuItem>
            <DropdownMenuItem disabled={!e.enTabla} onClick={() => c().deleteColumn().run()}><Trash2 /> Quitar columna</DropdownMenuItem>
            <DropdownMenuItem disabled={!e.enTabla} onClick={() => c().deleteTable().run()}><Trash2 /> Eliminar tabla</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <span className="ml-auto pr-2 text-[11px] text-muted-foreground">Clic en una celda para escribir · Tab para pasar a la siguiente</span>
    </div>
  );
}
