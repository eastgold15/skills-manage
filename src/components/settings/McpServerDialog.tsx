import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { McpServer, McpServerFormData } from "@/types";

interface McpServerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  server?: McpServer | null;
  onAdd: (data: McpServerFormData) => Promise<void>;
  onEdit: (id: string, data: McpServerFormData) => Promise<void>;
}

export function McpServerDialog({
  open,
  onOpenChange,
  server,
  onAdd,
  onEdit,
}: McpServerDialogProps) {
  const { t } = useTranslation();
  const isEdit = !!server;

  const [name, setName] = useState("");
  const [command, setCommand] = useState("");
  const [args, setArgs] = useState("");
  const [env, setEnv] = useState("");
  const [cwd, setCwd] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && server) {
      setName(server.name);
      setCommand(server.command);
      setArgs(server.args.join(" "));
      setEnv(server.env ? JSON.stringify(server.env, null, 2) : "");
      setCwd(server.cwd || "");
      setError(null);
    } else if (open) {
      setName("");
      setCommand("");
      setArgs("");
      setEnv("");
      setCwd("");
      setError(null);
    }
  }, [open, server]);

  async function handleSubmit() {
    if (!name.trim() || !command.trim()) {
      setError(t("mcpServerDialog.requiredFields"));
      return;
    }

    if (env && !isValidJson(env)) {
      setError(t("mcpServerDialog.invalidJson"));
      return;
    }

    setIsLoading(true);
    setError(null);

    const data: McpServerFormData = {
      name: name.trim(),
      command: command.trim(),
      args: args.trim(),
      env: env.trim() || undefined,
      cwd: cwd.trim() || undefined,
    };

    try {
      if (isEdit && server) {
        await onEdit(server.id, data);
        toast.success(t("mcpServerDialog.updateSuccess"));
      } else {
        await onAdd(data);
        toast.success(t("mcpServerDialog.addSuccess"));
      }
      onOpenChange(false);
    } catch (err) {
      setError(String(err));
    } finally {
      setIsLoading(false);
    }
  }

  function isValidJson(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("mcpServerDialog.editTitle") : t("mcpServerDialog.addTitle")}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? t("mcpServerDialog.editDesc") : t("mcpServerDialog.addDesc")}
          </DialogDescription>
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
            aria-label={t("common.close")}
          >
            <X className="size-4" />
          </button>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="name" className="mb-1 block">
              {t("mcpServerDialog.name")}
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("mcpServerDialog.namePlaceholder")}
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="command" className="mb-1 block">
              {t("mcpServerDialog.command")}
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="command"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="npx"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="args" className="mb-1 block">
              {t("mcpServerDialog.args")}
            </Label>
            <Input
              id="args"
              value={args}
              onChange={(e) => setArgs(e.target.value)}
              placeholder="-y gitnexus@latest mcp"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t("mcpServerDialog.argsHint")}
            </p>
          </div>

          <div>
            <Label htmlFor="env" className="mb-1 block">
              {t("mcpServerDialog.env")}
            </Label>
            <textarea
              id="env"
              value={env}
              onChange={(e) => setEnv(e.target.value)}
              placeholder='{"KEY": "value"}'
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t("mcpServerDialog.envHint")}
            </p>
          </div>

          <div>
            <Label htmlFor="cwd" className="mb-1 block">
              {t("mcpServerDialog.cwd")}
            </Label>
            <Input
              id="cwd"
              value={cwd}
              onChange={(e) => setCwd(e.target.value)}
              placeholder="/path/to/workdir"
              disabled={isLoading}
            />
          </div>

          {error && (
            <p className="text-xs text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isEdit ? t("common.save") : t("common.add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}