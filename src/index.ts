import { join, relative, posix } from "path";
import fs from "fs";
import chokidar from "chokidar";
import { Plugin } from "vite";

const cwd = process.cwd();
const PAGES_JSON_PATH = join(cwd, "src/pages.json");

function getRouteInfo(id: string) {
  if (!id.endsWith(".vue")) return null;
  const relativePath = relative(join(cwd, "src"), id);
  const parts = relativePath.split("/");

  if (parts[0] === "pages") {
    const route = posix.join(...parts).replace(/\.vue$/, "");
    return { type: "page", route };
  } else if (parts[0].startsWith("package")) {
    const subPackage = parts[0];
    const route = posix.join(...parts.slice(1)).replace(/\.vue$/, "");
    return { type: "subPackage", subPackage, route };
  }
}

function updatePagesJson(info: ReturnType<typeof getRouteInfo>) {
  if (!info) return;

  const jsonStr = fs.readFileSync(PAGES_JSON_PATH, "utf-8");
  const pagesJson = JSON.parse(jsonStr);

  if (info.type === "page") {
    if (!pagesJson.pages.some((p: any) => p.path === info.route)) {
      pagesJson.pages.push({
        path: info.route,
        style: { navigationStyle: "custom" },
      });
    }
  } else if (info.type === "subPackage") {
    let sub = pagesJson.subPackages?.find(
      (s: any) => s.root === info.subPackage
    );
    if (!sub) {
      sub = { name: info.subPackage, root: info.subPackage, pages: [] };
      pagesJson.subPackages = pagesJson.subPackages || [];
      pagesJson.subPackages.push(sub);
    }
    if (!sub.pages.some((p: any) => p.path === info.route)) {
      sub.pages.push({ path: info.route });
    }
  }

  fs.writeFileSync(
    PAGES_JSON_PATH,
    JSON.stringify(pagesJson, null, 2),
    "utf-8"
  );
}
function removeRouteFromPagesJson(info: ReturnType<typeof getRouteInfo>) {
  if (!info) return;
  const jsonStr = fs.readFileSync(PAGES_JSON_PATH, "utf-8");
  const pagesJson = JSON.parse(jsonStr);

  if (info.type === "page") {
    pagesJson.pages = pagesJson.pages.filter((p: any) => p.path !== info.route);
  } else if (info.type === "subPackage") {
    let sub = pagesJson.subPackages?.find(
      (s: any) => s.root === info.subPackage
    );
    if (sub) {
      sub.pages = sub.pages.filter((p: any) => p.path !== info.route);
      // 如果分包下没有页面了，可以选择移除整个分包
      if (sub.pages.length === 0) {
        pagesJson.subPackages = pagesJson.subPackages.filter(
          (s: any) => s.root !== info.subPackage
        );
      }
    }
  }
  fs.writeFileSync(
    PAGES_JSON_PATH,
    JSON.stringify(pagesJson, null, 2),
    "utf-8"
  );
}

function VitePluginUniFileToRoute(): Plugin {
  return {
    name: "vite-plugin-uni-fileToRoute",
    enforce: "pre",
    async configResolved(config: any) {
      if (config.command === "build") {
        if (config.build.watch) {
          const watcher = chokidar.watch(
            ["src/pages/**/*.vue", "src/package*/**/*.vue"],
            { ignoreInitial: true }
          );
          watcher.on("add", (file: string) => {
            console.log(file);

            const routeInfo = getRouteInfo(file);
            if (routeInfo) {
              updatePagesJson(routeInfo);
            }
          });

          watcher.on("unlink", (file: string) => {
            const routeInfo = getRouteInfo(file);
            if (routeInfo) {
              removeRouteFromPagesJson(routeInfo);
            }
          });
        }
      }
    },
    async transform(code: string, id: string) {},
    configureServer(server: any) {},
  };
}

export { VitePluginUniFileToRoute as default };
