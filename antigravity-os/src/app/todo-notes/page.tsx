"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/Card";
import { Button } from "@/ui/Button";
import { Badge } from "@/ui/Badge";
import {
  Sparkles,
  Plus,
  Trash2,
  CheckCircle,
  FileText,
  Paperclip,
  Cpu,
  Download,
  Image as ImageIcon,
  Check,
  RefreshCw,
} from "lucide-react";

export default function TodoNotesPage() {
  const [todos, setTodos] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [selectedNote, setSelectedNote] = useState<any | null>(null);

  // Todo Form
  const [newTodo, setNewTodo] = useState("");
  
  // Note Form
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteFile, setNoteFile] = useState<string | null>(null);

  // AI Prompt Form
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Canvas / SVG state
  const [drawings, setDrawings] = useState<string[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Auth helper
  const getAuthHeaders = () => {
    if (typeof window === "undefined") return {};
    const userStr = localStorage.getItem("omnicraft_user");
    if (!userStr) return {};
    try {
      const user = JSON.parse(userStr);
      return {
        "Authorization": `Bearer ${user.token}`,
        "Content-Type": "application/json",
      };
    } catch {
      return {};
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const headers = getAuthHeaders() as any;
      
      const tRes = await fetch("/api/todo-notes/todos", { headers });
      const tJson = await tRes.json();
      if (tJson.success) setTodos(tJson.data);

      const nRes = await fetch("/api/todo-notes/notes", { headers });
      const nJson = await nRes.json();
      if (nJson.success) {
        setNotes(nJson.data);
        if (nJson.data.length > 0 && !selectedNote) {
          setSelectedNote(nJson.data[0]);
          setNoteTitle(nJson.data[0].title);
          setNoteContent(nJson.data[0].content);
          setNoteFile(nJson.data[0].filePath);
        }
      }
    } catch (err) {
      console.error("Error loading todo/notes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    initCanvas();
  }, []);

  // Todo CRUD
  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    try {
      const headers = getAuthHeaders() as any;
      const res = await fetch("/api/todo-notes/todos", {
        method: "POST",
        headers,
        body: JSON.stringify({ title: newTodo }),
      });
      const json = await res.json();
      if (json.success) {
        setNewTodo("");
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleTodo = async (id: string, completed: boolean) => {
    try {
      const headers = getAuthHeaders() as any;
      const res = await fetch("/api/todo-notes/todos", {
        method: "PUT",
        headers,
        body: JSON.stringify({ id, completed: !completed }),
      });
      const json = await res.json();
      if (json.success) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      const headers = getAuthHeaders() as any;
      const res = await fetch(`/api/todo-notes/todos?id=${id}`, {
        method: "DELETE",
        headers,
      });
      const json = await res.json();
      if (json.success) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Notes CRUD
  const handleAddNote = async () => {
    try {
      const headers = getAuthHeaders() as any;
      const res = await fetch("/api/todo-notes/notes", {
        method: "POST",
        headers,
        body: JSON.stringify({ title: "Untitled Note", content: "" }),
      });
      const json = await res.json();
      if (json.success) {
        loadData();
        setSelectedNote(json.data);
        setNoteTitle(json.data.title);
        setNoteContent(json.data.content);
        setNoteFile(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedNote) return;
    try {
      const headers = getAuthHeaders() as any;
      const res = await fetch("/api/todo-notes/notes", {
        method: "PUT",
        headers,
        body: JSON.stringify({
          id: selectedNote.id,
          title: noteTitle,
          content: noteContent,
          filePath: noteFile,
        }),
      });
      const json = await res.json();
      if (json.success) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const headers = getAuthHeaders() as any;
      const res = await fetch(`/api/todo-notes/notes?id=${id}`, {
        method: "DELETE",
        headers,
      });
      const json = await res.json();
      if (json.success) {
        setSelectedNote(null);
        setNoteTitle("");
        setNoteContent("");
        setNoteFile(null);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectNote = (note: any) => {
    setSelectedNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteFile(note.filePath);
  };

  // Upload Attachment
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedNote) return;
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const userStr = localStorage.getItem("omnicraft_user");
      const token = userStr ? JSON.parse(userStr).token : "";

      const res = await fetch("/api/todo-notes/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        setNoteFile(json.fileUrl);
        // Automatically save note update
        const headers = getAuthHeaders() as any;
        await fetch("/api/todo-notes/notes", {
          method: "PUT",
          headers,
          body: JSON.stringify({
            id: selectedNote.id,
            title: noteTitle,
            content: noteContent,
            filePath: json.fileUrl,
          }),
        });
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  // AI Assistant Summary
  const handleAiAction = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    setAiResponse("");
    try {
      const headers = getAuthHeaders() as any;
      const res = await fetch("/api/todo-notes/ai", {
        method: "POST",
        headers,
        body: JSON.stringify({
          prompt: aiPrompt,
          content: noteContent,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setAiResponse(json.data.text);
      } else {
        setAiResponse(`Error: ${json.error}`);
      }
    } catch (err: any) {
      setAiResponse(`Error: ${err.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Export Data
  const handleExport = () => {
    const userStr = localStorage.getItem("omnicraft_user");
    const token = userStr ? JSON.parse(userStr).token : "";
    window.open(`/api/todo-notes/export?token=${token}`, "_blank");
  };

  // Canvas logic
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 400;
    canvas.height = 200;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#00f0ff";
    ctx.lineWidth = 3;
    contextRef.current = ctx;
  };

  const startDrawing = ({ nativeEvent }: React.MouseEvent) => {
    const { offsetX, offsetY } = nativeEvent;
    if (!contextRef.current) return;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }: React.MouseEvent) => {
    if (!isDrawing || !contextRef.current) return;
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    if (!contextRef.current) return;
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;
    contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
  };

  const generateDrawingSVG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Export data URL as a temporary logo drawing
    const dataUrl = canvas.toDataURL("image/png");
    setDrawings([dataUrl, ...drawings]);
    // Save PNG url directly as attachment if note selected
    if (selectedNote) {
      setNoteFile(dataUrl);
    }
  };

  return (
    <div className="space-y-6 font-mono text-slate-100">
      {/* Ribbon */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyber-cyan shadow-glow-cyan" />
            <span>SOVEREIGN TASK & NOTES ENVIRONMENT</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Build and persists real-time structured notes, tasks, drawing sketches, and attachments.
          </p>
        </div>

        <div className="flex gap-3">
          <Button onClick={loadData} variant="secondary" size="sm" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            <span>Sync Live</span>
          </Button>

          <Button onClick={handleExport} variant="primary" size="sm" className="gap-2 bg-cyber-purple border-cyber-purple/50">
            <Download className="w-4 h-4" />
            <span>Export Markdown</span>
          </Button>
        </div>
      </div>

      {/* Main Workspace grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Todos Card */}
        <Card glow="cyan" className="lg:col-span-4 h-fit">
          <CardHeader className="flex flex-row justify-between items-center border-b border-white/5 pb-4">
            <CardTitle className="text-xs font-bold tracking-wider flex items-center gap-2 text-cyber-cyan">
              <CheckCircle className="w-4 h-4" />
              <span>TASK BOARD</span>
            </CardTitle>
            <Badge variant="cyan">{todos.length} Active</Badge>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {/* Create Todo Form */}
            <form onSubmit={handleAddTodo} className="flex gap-2">
              <input
                type="text"
                required
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Initialize new objective..."
                className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyber-cyan text-slate-200"
              />
              <Button type="submit" size="sm" className="px-3">
                <Plus className="w-4 h-4" />
              </Button>
            </form>

            {/* Todos List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {todos.length === 0 ? (
                <div className="text-[10px] text-slate-500 text-center py-6">
                  No registered active operations.
                </div>
              ) : (
                todos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex justify-between items-center p-2.5 rounded-lg bg-slate-950/40 border border-white/5 hover:border-white/10 transition-all text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        onClick={() => handleToggleTodo(todo.id, todo.completed)}
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                          todo.completed
                            ? "bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan"
                            : "border-white/20 hover:border-white/40"
                        }`}
                      >
                        {todo.completed && <Check className="w-3 h-3" />}
                      </button>
                      <span className={`truncate ${todo.completed ? "line-through text-slate-500" : "text-slate-300"}`}>
                        {todo.title}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-white/5 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Center: Notes Card */}
        <Card glow="purple" className="lg:col-span-8 flex flex-col md:grid md:grid-cols-12 md:divide-x md:divide-white/10">
          {/* Notes List Column */}
          <div className="md:col-span-4 p-4 space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-xs font-bold text-cyber-purple flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>MEMO FILES</span>
              </div>
              <Button onClick={handleAddNote} size="sm" className="h-7 w-7 p-0 bg-cyber-purple/20 text-cyber-purple hover:bg-cyber-purple/40 border border-cyber-purple/30">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1">
              {notes.length === 0 ? (
                <div className="text-[10px] text-slate-500 text-center py-6">
                  No note files present.
                </div>
              ) : (
                notes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => selectNote(note)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs flex justify-between items-center ${
                      selectedNote?.id === note.id
                        ? "bg-cyber-purple/15 text-cyber-purple border-cyber-purple/40"
                        : "bg-slate-950/40 text-slate-300 border-white/5 hover:border-white/15"
                    }`}
                  >
                    <span className="truncate pr-2 font-semibold">
                      {note.title || "Untitled Note"}
                    </span>
                    {note.filePath && <Paperclip className="w-3 h-3 text-slate-500 shrink-0" />}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Active Note Editing Column */}
          <div className="md:col-span-8 p-4 flex flex-col justify-between h-[450px]">
            {selectedNote ? (
              <div className="space-y-4 flex-1 flex flex-col">
                <div className="flex justify-between items-center">
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="Note Title..."
                    className="bg-transparent text-sm font-bold border-b border-white/5 focus:border-cyber-purple focus:outline-none pb-1 w-full text-slate-100"
                  />
                  <button
                    onClick={() => handleDeleteNote(selectedNote.id)}
                    className="p-1 text-slate-500 hover:text-red-400 rounded hover:bg-white/5 transition-all ml-2"
                    title="Delete Note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Draft note details here..."
                  className="flex-1 bg-slate-950/40 border border-white/5 rounded-lg p-3 text-xs focus:outline-none focus:border-cyber-purple text-slate-300 resize-none font-mono"
                />

                {/* Attachment info */}
                {noteFile && (
                  <div className="flex justify-between items-center p-2 rounded-lg bg-slate-950 border border-white/10 text-[10px]">
                    <div className="flex items-center gap-2 truncate pr-2">
                      <Paperclip className="w-3.5 h-3.5 text-cyber-purple" />
                      <span className="text-slate-400 truncate font-mono">{noteFile}</span>
                    </div>
                    <button
                      onClick={() => setNoteFile(null)}
                      className="text-red-400 hover:text-red-500 px-1 font-bold"
                    >
                      Clear
                    </button>
                  </div>
                )}

                {/* Action panel */}
                <div className="flex justify-between items-center gap-3 pt-2">
                  <div className="flex gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleUpload}
                      className="hidden"
                      accept="*/*"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      variant="secondary"
                      size="sm"
                      className="gap-2.5 text-[10px] h-8"
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>{isUploading ? "UPLOADING..." : "ATTACH FILE"}</span>
                    </Button>
                  </div>

                  <Button
                    onClick={handleSaveNote}
                    variant="primary"
                    size="sm"
                    className="bg-cyber-purple border-cyber-purple/50 h-8 font-semibold text-xs"
                  >
                    <span>SAVE NOTE CHANGES</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-500 font-mono">
                Select or initialize a memo file to begin editing.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Futuristic Drawing Logo Board and AI Assistant Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Drawing Canvas */}
        <Card glow="cyan">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle className="text-xs font-bold text-cyber-cyan flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              <span>DIGITAL DRAWING CANVAS (LOGO GENERATOR)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="relative border border-white/10 rounded-xl overflow-hidden bg-slate-950">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="w-full cursor-crosshair h-[200px]"
              />
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Button onClick={clearCanvas} variant="secondary" size="sm">
                  <span>Clear Canvas</span>
                </Button>
                <Button onClick={generateDrawingSVG} variant="primary" size="sm" className="bg-cyber-cyan border-cyber-cyan/50 text-slate-950">
                  <span>Register Drawing</span>
                </Button>
              </div>

              {drawings.length > 0 && (
                <Badge variant="cyan" className="text-[10px]">
                  {drawings.length} Drawings Cached
                </Badge>
              )}
            </div>

            {/* Drawings gallery */}
            {drawings.length > 0 && (
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/5">
                {drawings.map((drawSrc, idx) => (
                  <div key={idx} className="relative rounded-lg overflow-hidden border border-white/10 bg-slate-950 p-1">
                    <img src={drawSrc} alt={`canvas_${idx}`} className="object-contain h-12 w-full" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Assistant Summarizer */}
        <Card glow="purple">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle className="text-xs font-bold text-cyber-purple flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              <span>COGNITIVE AI ASSISTANT</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] text-slate-400">COMMAND PROMPT</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. Summarize active note, extract action tasks..."
                  className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyber-purple text-slate-200"
                />
                <Button
                  onClick={handleAiAction}
                  disabled={isAiLoading || !selectedNote}
                  variant="primary"
                  className="bg-cyber-purple border-cyber-purple/50 text-xs px-4"
                >
                  <span>{isAiLoading ? "PROCESSING..." : "ASK AI"}</span>
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400">ASSISTANT LOG OUTPUT</label>
              <div className="h-[140px] bg-slate-950/60 border border-white/10 rounded-xl p-3 text-xs overflow-y-auto text-slate-300 font-mono">
                {aiResponse ? (
                  <p className="whitespace-pre-wrap leading-relaxed">{aiResponse}</p>
                ) : (
                  <span className="text-slate-600">Cognitive output logs idle. Send a command context...</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
