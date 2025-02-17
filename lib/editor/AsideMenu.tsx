import { useMode } from "../stores/ModeProvider";
import { PlusIcon } from "@radix-ui/react-icons";
import { PathButton } from "./PathButton";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useEffect, useMemo, useState } from "react";
import { MethodBtn } from "./MethodRenderer";
import { FlowsList } from "./FlowsList";
import { useController } from "../stores/Controller";
import { EmptyState } from "../components";
import { cn, parse, transformPaths } from "../utils";
import { useSettings } from "../stores/Config";

function UploadSwagger() {
  const [file, setFile] = useState<FileList | null>(null);
  const { loadPaths } = useController();
  useEffect(() => {
    if (file && file.length > 0) {
      const $file = file.item(0);
      if ($file) {
        const reader = new FileReader();
        reader.readAsText($file);
        reader.onload = (e) => {
          const text = e.target?.result;
          if (typeof text === "string") {
            const json = parse(text);
            loadPaths(transformPaths(json.paths));
            console.log("paths loaded");
          }
        };
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);
  return (
    <EmptyState>
      <input
        type="file"
        className="hidden"
        id="swagger-file-input"
        multiple={false}
        accept="application/json"
        onChange={(ev) => setFile(ev.target.files)}
      />
      <div className="mt-4">
        <label
          htmlFor="swagger-file-input"
          role="button"
          className="bg-indigo-500 rounded px-2 cursor-pointer py-1 space-x-1 text-white"
        >
          <span>Load from Swagger</span>
          <PlusIcon className="inline" />
        </label>
      </div>
    </EmptyState>
  );
}

export function AsideMenu() {
  const { standalone } = useSettings();
  const {
    state: { paths },
    loadPaths,
  } = useController();

  const { mode, isEdit } = useMode();

  const [search, setSearch] = useState("");

  const renderedPaths = useMemo(
    () =>
      search.trim().length > 0
        ? paths.filter((path) => path.path.includes(search.trim()))
        : paths,
    [search, paths]
  );

  return (
    <aside
      className={cn(
        "h-full z-20 max-h-full absolute max-w-sm w-full overflow-hidden ease-in-out origin-right bg-white border-r-4 border-neutral-100 shadow-lg"
      )}
    >
      <div className="w-full h-full py-2">
        <div
          data-container="select-node"
          data-hidden={isEdit}
          className="w-full h-full max-h-full overflow-hidden flex items-start flex-col data-[hidden=true]:hidden data-[hidden=true]:animate-out data-[hidden=true]:slide-out-to-left-full animate-in [&>*]:w-full gap-5"
        >
          <div className="px-4 pt-4 flex items-center">
            <h1 className="text-base font-semibold flex-1 text-slate-800">
              Select Step
            </h1>
          </div>
          <div className="w-full px-4">
            <div className="flex items-center border border-black/50 rounded overflow-hidden focus-within:ring-1 ring-indigo-500">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="flex-1 border-stone-500 p-2 outline-none text-slate-700"
              />
              <span className="p-2 text-2xl text-stone-500">
                <MagnifyingGlassIcon />
              </span>
            </div>
          </div>
          <div className="flex-1 px-4 overflow-auto pb-8">
            <ul className="space-y-1 select-none h-fit">
              {renderedPaths.length > 0 ? (
                <>
                  {renderedPaths.map((path) => (
                    <li key={path.path} className="w-full">
                      <PathButton path={path} />
                    </li>
                  ))}
                </>
              ) : (
                standalone && <UploadSwagger />
              )}
            </ul>
          </div>
        </div>
        <div
          className="w-full h-full flex pt-4 items-start flex-col data-[hidden=true]:animate-out animate-in data-[hidden=true]:hidden data-[hidden=true]:slide-out-to-right-full"
          data-container="edit-node"
          data-hidden={!isEdit}
        >
          {mode.type === "edit-node" && (
            <div className="px-4 space-y-2">
              <div className="w-full">
                <h1 className="text-xl font-semibold text-slate-800 space-x-1">
                  <code>{mode.node.data.path}</code>
                  <MethodBtn
                    method={mode.node.data.method}
                    className="pointer-events-none inline text-xs"
                  >
                    {mode.node.data.method}
                  </MethodBtn>
                </h1>
              </div>
              <div>
                {mode.node.data.tags?.map((t) => (
                  <span className="text-sm">#{t}</span>
                ))}
              </div>
              <div className="p-2 flex-1 w-full">
                <p>{mode.node.data.description}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <FlowsList />
    </aside>
  );
}
