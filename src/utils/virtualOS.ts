export interface VFSNode {
  name: string;
  type: "file" | "dir";
  content?: string;
  size?: number;
  permissions?: string;
  owner?: string;
  group?: string;
  updatedAt?: string;
  children?: Record<string, VFSNode>;
}

export interface VFSTree {
  root: VFSNode;
}

const STORAGE_KEY_VFS = "portfolio_vfs_data";
const STORAGE_KEY_THEME = "portfolio_cli_theme";

export const initialVFS: VFSNode = {
  name: "",
  type: "dir",
  permissions: "drwxr-xr-x",
  owner: "root",
  group: "root",
  updatedAt: "Sep 02 00:00",
  children: {
    home: {
      name: "home",
      type: "dir",
      permissions: "drwxr-xr-x",
      owner: "root",
      group: "root",
      updatedAt: "Sep 02 00:00",
      children: {
        karan: {
          name: "karan",
          type: "dir",
          permissions: "drwxr-xr-x",
          owner: "karan",
          group: "staff",
          updatedAt: "Sep 02 00:59",
          children: {
            "README.md": {
              name: "README.md",
              type: "file",
              permissions: "-rw-r--r--",
              owner: "karan",
              group: "staff",
              size: 2555,
              updatedAt: "Sep 02 00:59",
              content: `# Karan Gholap — Portfolio System\nSoftware Developer based in Pune, India 🇮🇳\n\n- Stack: React, Next.js, Node.js, TypeScript, PostgreSQL, Supabase\n- Role: Trainee Developer @ CandorWorks\n- Founder: Private Academy Engineering\n\nTry running 'projects', 'experience', 'education', or 'ssh guest@karan-server'.`,
            },
            "resume.pdf": {
              name: "resume.pdf",
              type: "file",
              permissions: "-rw-r--r--",
              owner: "karan",
              group: "staff",
              size: 409600,
              updatedAt: "Sep 02 00:59",
              content: "[Binary PDF Data] - Type 'download' to save Karan Gholap's resume PDF.",
            },
            "notes.txt": {
              name: "notes.txt",
              type: "file",
              permissions: "-rw-r--r--",
              owner: "karan",
              group: "staff",
              size: 142,
              updatedAt: "Sep 02 01:20",
              content: "Upcoming tasks:\n1. Deploy VFS and Virtual OS terminal update.\n2. Review Supabase database queries.\n3. Optimise image loading performance.",
            },
            projects: {
              name: "projects",
              type: "dir",
              permissions: "drwxr-xr-x",
              owner: "karan",
              group: "staff",
              updatedAt: "Sep 02 01:00",
              children: {
                "private-academy.md": {
                  name: "private-academy.md",
                  type: "file",
                  permissions: "-rw-r--r--",
                  owner: "karan",
                  group: "staff",
                  size: 512,
                  updatedAt: "Sep 02 01:00",
                  content: "# Private Academy Engineering\nEdTech platform designed and deployed for Mumbai University Computer Engineering students.",
                },
                "bursana.md": {
                  name: "bursana.md",
                  type: "file",
                  permissions: "-rw-r--r--",
                  owner: "karan",
                  group: "staff",
                  size: 380,
                  updatedAt: "Sep 02 01:00",
                  content: "# BURSANA Fashion Tech\nTech & Business efficiency platform integration.",
                },
              },
            },
          },
        },
        guest: {
          name: "guest",
          type: "dir",
          permissions: "drwxr-xr-x",
          owner: "guest",
          group: "guest",
          updatedAt: "Sep 02 00:00",
          children: {
            "welcome.txt": {
              name: "welcome.txt",
              type: "file",
              permissions: "-rw-r--r--",
              owner: "guest",
              group: "guest",
              size: 180,
              updatedAt: "Sep 02 00:00",
              content: "Welcome guest! You can create files using 'touch filename', directories using 'mkdir dirname', and write using 'echo text > filename'.",
            },
          },
        },
      },
    },
    var: {
      name: "var",
      type: "dir",
      permissions: "drwxr-xr-x",
      owner: "root",
      group: "root",
      updatedAt: "Sep 02 00:00",
      children: {
        log: {
          name: "log",
          type: "dir",
          permissions: "drwxr-xr-x",
          owner: "root",
          group: "root",
          updatedAt: "Sep 02 00:00",
          children: {
            syslog: {
              name: "syslog",
              type: "file",
              permissions: "-rw-r-----",
              owner: "syslog",
              group: "adm",
              size: 1024,
              updatedAt: "Sep 02 23:30",
              content: "[INFO] systemd[1]: Started Portfolio virtual terminal engine v2.5.\n[INFO] sshd[4092]: Server listening on 0.0.0.0 port 22.\n[INFO] kernel: Linux 6.8.0-40-generic x86_64 SMP.",
            },
            "auth.log": {
              name: "auth.log",
              type: "file",
              permissions: "-rw-r-----",
              owner: "root",
              group: "adm",
              size: 450,
              updatedAt: "Sep 02 23:25",
              content: "Sep 02 23:22:10 karan-server sshd[4102]: Accepted publickey for guest from 103.42.18.5 port 54312 ssh2\nSep 02 23:22:10 karan-server pam_unix(sshd:session): session opened for user guest.",
            },
          },
        },
      },
    },
    etc: {
      name: "etc",
      type: "dir",
      permissions: "drwxr-xr-x",
      owner: "root",
      group: "root",
      updatedAt: "Sep 02 00:00",
      children: {
        hostname: {
          name: "hostname",
          type: "file",
          permissions: "-rw-r--r--",
          owner: "root",
          group: "root",
          size: 17,
          updatedAt: "Sep 02 00:00",
          content: "karan-server.dev",
        },
        "os-release": {
          name: "os-release",
          type: "file",
          permissions: "-rw-r--r--",
          owner: "root",
          group: "root",
          size: 240,
          updatedAt: "Sep 02 00:00",
          content: 'NAME="Ubuntu"\nVERSION="24.04.1 LTS (Noble Numbat)"\nID=ubuntu\nPRETTY_NAME="Ubuntu 24.04.1 LTS"\nVERSION_ID="24.04"',
        },
      },
    },
    tmp: {
      name: "tmp",
      type: "dir",
      permissions: "drwxrwxrwt",
      owner: "root",
      group: "root",
      updatedAt: "Sep 02 00:00",
      children: {},
    },
  },
};

export const loadVFS = (): VFSNode => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_VFS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.children) return parsed;
    }
  } catch {
    // fallback to initialVFS
  }
  return initialVFS;
};

export const saveVFS = (vfs: VFSNode): void => {
  try {
    localStorage.setItem(STORAGE_KEY_VFS, JSON.stringify(vfs));
  } catch {
    // ignore quota error
  }
};

export const loadTheme = (): string => {
  return localStorage.getItem(STORAGE_KEY_THEME) || "default";
};

export const saveTheme = (theme: string): void => {
  localStorage.setItem(STORAGE_KEY_THEME, theme);
};

export const resolvePath = (currentDir: string, targetPath: string): string => {
  let cleanTarget = targetPath.trim();
  if (!cleanTarget || cleanTarget === ".") return currentDir;
  if (cleanTarget === "~") return "/home/karan";
  if (cleanTarget.startsWith("~/")) {
    cleanTarget = "/home/karan/" + cleanTarget.slice(2);
  }

  const parts = cleanTarget.startsWith("/")
    ? cleanTarget.split("/")
    : (currentDir === "/" ? "" : currentDir).split("/").concat(cleanTarget.split("/"));

  const stack: string[] = [];
  for (const part of parts) {
    if (!part || part === ".") continue;
    if (part === "..") {
      if (stack.length > 0) stack.pop();
    } else {
      stack.push(part);
    }
  }

  return "/" + stack.join("/");
};

export const getNodeAtPath = (root: VFSNode, pathStr: string): VFSNode | null => {
  if (pathStr === "/") return root;
  const parts = pathStr.split("/").filter(Boolean);
  let current: VFSNode = root;

  for (const part of parts) {
    if (!current.children || !current.children[part]) {
      return null;
    }
    current = current.children[part];
  }
  return current;
};

export const formatLsOutput = (
  root: VFSNode,
  currentDir: string,
  targetPath?: string,
  showAll = false,
  showLong = false
): string[] => {
  const target = targetPath ? resolvePath(currentDir, targetPath) : currentDir;
  const node = getNodeAtPath(root, target);

  if (!node) {
    return [`  ls: cannot access '${targetPath || target}': No such file or directory`];
  }

  if (node.type === "file") {
    if (showLong) {
      return [`  ${node.permissions} 1 ${node.owner} ${node.group} ${String(node.size || 0).padStart(6)} ${node.updatedAt} ${node.name}`];
    }
    return [`  ${node.name}`];
  }

  if (!node.children || Object.keys(node.children).length === 0) {
    return ["  (directory empty)"];
  }

  const entries = Object.values(node.children);
  const lines: string[] = [];

  if (showLong) {
    lines.push(`  total ${entries.length * 4}`);
    if (showAll) {
      lines.push(`  drwxr-xr-x 2 ${node.owner} ${node.group} 4096 ${node.updatedAt} .`);
      lines.push(`  drwxr-xr-x 2 root root 4096 ${node.updatedAt} ..`);
    }
    entries.forEach((child) => {
      const typeChar = child.type === "dir" ? "d" : "-";
      const perm = child.permissions || `${typeChar}rw-r--r--`;
      const owner = (child.owner || "karan").padEnd(6);
      const group = (child.group || "staff").padEnd(6);
      const size = String(child.size || (child.type === "dir" ? 4096 : 0)).padStart(7);
      const date = child.updatedAt || "Sep 02 00:00";
      const icon = child.type === "dir" ? "📁 " : "📄 ";
      lines.push(`  ${perm} 1 ${owner} ${group} ${size} ${date} ${icon}${child.name}${child.type === "dir" ? "/" : ""}`);
    });
  } else {
    const formatted = entries
      .filter((c) => showAll || !c.name.startsWith("."))
      .map((c) => (c.type === "dir" ? `📁 ${c.name}/` : `📄 ${c.name}`))
      .join("   ");
    lines.push(`  ${formatted}`);
  }

  return lines;
};

export const executeMkdir = (
  root: VFSNode,
  currentDir: string,
  dirName: string,
  user = "karan"
): { success: boolean; message: string; updatedRoot?: VFSNode } => {
  if (!dirName) return { success: false, message: "  mkdir: missing operand" };
  const targetPath = resolvePath(currentDir, dirName);
  const pathParts = targetPath.split("/").filter(Boolean);
  const newDirName = pathParts.pop();
  const parentPath = "/" + pathParts.join("/");

  if (!newDirName) return { success: false, message: "  mkdir: invalid directory name" };

  const cloneRoot = JSON.parse(JSON.stringify(root)) as VFSNode;
  const parentNode = getNodeAtPath(cloneRoot, parentPath);

  if (!parentNode || parentNode.type !== "dir") {
    return { success: false, message: `  mkdir: cannot create directory '${dirName}': No such file or directory` };
  }

  if (!parentNode.children) parentNode.children = {};
  if (parentNode.children[newDirName]) {
    return { success: false, message: `  mkdir: cannot create directory '${dirName}': File exists` };
  }

  parentNode.children[newDirName] = {
    name: newDirName,
    type: "dir",
    permissions: "drwxr-xr-x",
    owner: user,
    group: user === "root" ? "root" : "staff",
    updatedAt: "Sep 02 23:30",
    children: {},
  };

  saveVFS(cloneRoot);
  return { success: true, message: `  Created directory '${newDirName}'`, updatedRoot: cloneRoot };
};

export const executeTouch = (
  root: VFSNode,
  currentDir: string,
  fileName: string,
  user = "karan"
): { success: boolean; message: string; updatedRoot?: VFSNode } => {
  if (!fileName) return { success: false, message: "  touch: missing file operand" };
  const targetPath = resolvePath(currentDir, fileName);
  const pathParts = targetPath.split("/").filter(Boolean);
  const newFileName = pathParts.pop();
  const parentPath = "/" + pathParts.join("/");

  if (!newFileName) return { success: false, message: "  touch: invalid file name" };

  const cloneRoot = JSON.parse(JSON.stringify(root)) as VFSNode;
  const parentNode = getNodeAtPath(cloneRoot, parentPath);

  if (!parentNode || parentNode.type !== "dir") {
    return { success: false, message: `  touch: cannot touch '${fileName}': No such file or directory` };
  }

  if (!parentNode.children) parentNode.children = {};

  if (parentNode.children[newFileName]) {
    parentNode.children[newFileName].updatedAt = "Sep 02 23:30";
  } else {
    parentNode.children[newFileName] = {
      name: newFileName,
      type: "file",
      permissions: "-rw-r--r--",
      owner: user,
      group: user === "root" ? "root" : "staff",
      size: 0,
      updatedAt: "Sep 02 23:30",
      content: "",
    };
  }

  saveVFS(cloneRoot);
  return { success: true, message: `  Touched file '${newFileName}'`, updatedRoot: cloneRoot };
};

export const executeRm = (
  root: VFSNode,
  currentDir: string,
  targetName: string,
  isRecursive = false
): { success: boolean; message: string; updatedRoot?: VFSNode } => {
  if (!targetName) return { success: false, message: "  rm: missing operand" };
  const targetPath = resolvePath(currentDir, targetName);
  if (targetPath === "/" || targetPath === "/home/karan") {
    return { success: false, message: `  rm: cannot remove protected directory '${targetPath}'` };
  }

  const pathParts = targetPath.split("/").filter(Boolean);
  const nodeToDelete = pathParts.pop();
  const parentPath = "/" + pathParts.join("/");

  if (!nodeToDelete) return { success: false, message: "  rm: invalid operand" };

  const cloneRoot = JSON.parse(JSON.stringify(root)) as VFSNode;
  const parentNode = getNodeAtPath(cloneRoot, parentPath);

  if (!parentNode || !parentNode.children || !parentNode.children[nodeToDelete]) {
    return { success: false, message: `  rm: cannot remove '${targetName}': No such file or directory` };
  }

  const targetNode = parentNode.children[nodeToDelete];
  if (targetNode.type === "dir" && !isRecursive) {
    return { success: false, message: `  rm: cannot remove '${targetName}': Is a directory. Use 'rm -r ${targetName}'` };
  }

  delete parentNode.children[nodeToDelete];
  saveVFS(cloneRoot);
  return { success: true, message: `  Removed '${targetName}'`, updatedRoot: cloneRoot };
};

export const executeCat = (root: VFSNode, currentDir: string, filePath: string): string[] => {
  if (!filePath) return ["  cat: missing file operand"];
  const targetPath = resolvePath(currentDir, filePath);
  const node = getNodeAtPath(root, targetPath);

  if (!node) return [`  cat: ${filePath}: No such file or directory`];
  if (node.type === "dir") return [`  cat: ${filePath}: Is a directory`];

  const content = node.content ?? "";
  return content.split("\n").map((line) => "  " + line);
};

export const executeWriteFile = (
  root: VFSNode,
  currentDir: string,
  filePath: string,
  content: string,
  isAppend = false,
  user = "karan"
): { success: boolean; message: string; updatedRoot?: VFSNode } => {
  const targetPath = resolvePath(currentDir, filePath);
  const pathParts = targetPath.split("/").filter(Boolean);
  const fileName = pathParts.pop();
  const parentPath = "/" + pathParts.join("/");

  if (!fileName) return { success: false, message: "  Invalid filename" };

  const cloneRoot = JSON.parse(JSON.stringify(root)) as VFSNode;
  const parentNode = getNodeAtPath(cloneRoot, parentPath);

  if (!parentNode || parentNode.type !== "dir") {
    return { success: false, message: `  No such directory: '${parentPath}'` };
  }

  if (!parentNode.children) parentNode.children = {};

  const existingFile = parentNode.children[fileName];
  const newContent = isAppend && existingFile ? (existingFile.content ? existingFile.content + "\n" + content : content) : content;

  parentNode.children[fileName] = {
    name: fileName,
    type: "file",
    permissions: "-rw-r--r--",
    owner: user,
    group: user === "root" ? "root" : "staff",
    size: newContent.length,
    updatedAt: "Sep 02 23:30",
    content: newContent,
  };

  saveVFS(cloneRoot);
  return { success: true, message: `  Wrote to '${fileName}' (${newContent.length} bytes)`, updatedRoot: cloneRoot };
};

export const serversInfo: Record<string, { os: string; ip: string; user: string }> = {
  "karan-server": { os: "Ubuntu 24.04.1 LTS (GNU/Linux 6.8.0-40-generic x86_64)", ip: "192.168.1.100", user: "guest" },
  "karan-server.dev": { os: "Ubuntu 24.04.1 LTS (GNU/Linux 6.8.0-40-generic x86_64)", ip: "192.168.1.100", user: "guest" },
  "academy-server": { os: "Debian GNU/Linux 12 (bookworm) x86_64", ip: "10.0.4.15", user: "admin" },
  "localhost": { os: "PortfolioOS v2.5 (Web/Linux)", ip: "127.0.0.1", user: "dev" },
};

export const getSSHBanner = (host: string, user: string): string[] => {
  const info = serversInfo[host] || { os: "Ubuntu 24.04.1 LTS", ip: "172.16.0.42", user };
  const nowStr = new Date().toUTCString();

  return [
    "",
    `  🔑 Connecting to SSH server [${host}:22] as user '${user}'...`,
    "  Verifying ECDSA host key fingerprint SHA256:8f9a2b1c4e7d...",
    "  Authenticating with public key 'id_ed25519'...",
    "",
    `  Welcome to ${info.os}`,
    "",
    "   * Documentation:  https://help.ubuntu.com",
    "   * Management:     https://landscape.canonical.com",
    "   * Support:        https://ubuntu.com/pro",
    "",
    `  System information as of ${nowStr}:`,
    "    System load  : 0.14               Processes             : 118",
    "    Usage of /   : 24.2% of 48.50GB   Users logged in       : 1",
    `    Memory usage : 21.8%              IPv4 eth0             : ${info.ip}`,
    "",
    "  Connected to simulated remote server.",
    "  Type 'exit' or 'logout' to return to your local terminal shell.",
    "",
  ];
};

export interface ProcessItem {
  pid: number;
  user: string;
  pr: string;
  ni: number;
  virt: string;
  res: string;
  shr: string;
  status: string;
  cpu: number;
  mem: number;
  time: string;
  command: string;
}

export const generateTopData = (tick: number) => {
  const cpuVal = (12.4 + (Math.sin(tick * 0.5) * 4.5 + Math.random() * 2)).toFixed(1);
  const memVal = (24.8 + Math.cos(tick * 0.3) * 1.2).toFixed(1);
  const tasksCount = 118;
  const runningCount = 2;
  const sleepingCount = 116;

  const processes: ProcessItem[] = [
    { pid: 4092, user: "root", pr: "20", ni: 0, virt: "184.2M", res: "12.4M", shr: "8.1M", status: "S", cpu: parseFloat((3.2 + Math.random() * 1.5).toFixed(1)), mem: 1.2, time: "0:14.22", command: "sshd: guest@pts/0" },
    { pid: 1204, user: "karan", pr: "20", ni: 0, virt: "450.8M", res: "64.2M", shr: "24.0M", status: "R", cpu: parseFloat((4.5 + Math.random() * 2.0).toFixed(1)), mem: 4.1, time: "1:02.10", command: "node server.js" },
    { pid: 884, user: "postgres", pr: "20", ni: 0, virt: "320.0M", res: "48.1M", shr: "18.5M", status: "S", cpu: parseFloat((1.1 + Math.random() * 0.5).toFixed(1)), mem: 3.0, time: "0:45.08", command: "postgres: writer process" },
    { pid: 512, user: "www-data", pr: "20", ni: 0, virt: "142.0M", res: "18.9M", shr: "9.2M", status: "S", cpu: parseFloat((0.8 + Math.random() * 0.4).toFixed(1)), mem: 1.1, time: "0:12.40", command: "nginx: worker process" },
    { pid: 1, user: "root", pr: "20", ni: 0, virt: "168.4M", res: "13.2M", shr: "8.8M", status: "S", cpu: 0.0, mem: 0.8, time: "0:04.12", command: "/sbin/init splash" },
    { pid: 2410, user: "karan", pr: "20", ni: 0, virt: "89.2M", res: "8.4M", shr: "5.1M", status: "R", cpu: parseFloat((2.0 + Math.random() * 1.0).toFixed(1)), mem: 0.5, time: "0:00.84", command: "top" },
    { pid: 312, user: "root", pr: "20", ni: 0, virt: "94.0M", res: "6.1M", shr: "4.2M", status: "S", cpu: 0.0, mem: 0.4, time: "0:01.05", command: "systemd-journald" },
  ];

  return {
    cpuVal,
    memVal,
    tasksCount,
    runningCount,
    sleepingCount,
    uptimeStr: "42 days, 14:22:05",
    loadAvg: "0.14, 0.18, 0.15",
    processes,
  };
};

export const executePing = (host: string): string[] => {
  const targetHost = host || "8.8.8.8";
  const ip = targetHost === "google.com" ? "142.250.190.46" : targetHost === "karan-server" ? "192.168.1.100" : targetHost;

  return [
    "",
    `  PING ${targetHost} (${ip}) 56(84) bytes of data.`,
    `  64 bytes from ${ip}: icmp_seq=1 ttl=117 time=14.2 ms`,
    `  64 bytes from ${ip}: icmp_seq=2 ttl=117 time=12.8 ms`,
    `  64 bytes from ${ip}: icmp_seq=3 ttl=117 time=15.1 ms`,
    `  64 bytes from ${ip}: icmp_seq=4 ttl=117 time=13.5 ms`,
    "",
    `  --- ${targetHost} ping statistics ---`,
    "  4 packets transmitted, 4 received, 0% packet loss, time 3004ms",
    "  rtt min/avg/max/mdev = 12.810/13.900/15.120/0.854 ms",
    "",
  ];
};

export const executeDf = (): string[] => [
  "",
  "  Filesystem     1K-blocks      Used Available Use% Mounted on",
  "  /dev/sda1       50860224  12340112  35900504  26% /",
  "  tmpfs            8142340         0   8142340   0% /dev/shm",
  "  /dev/sda2        2048000    145000   1903000   8% /boot",
  "  overlay         50860224  12340112  35900504  26% /var/lib/docker",
  "",
];

export const executeFree = (): string[] => [
  "",
  "               total        used        free      shared  buff/cache   available",
  "  Mem:         16284        3840       10120         210        2324       12100",
  "  Swap:         2048           0        2048",
  "",
];

export const executeNetstat = (): string[] => [
  "",
  "  Active Internet connections (only servers)",
  "  Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name",
  "  tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      4092/sshd",
  "  tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      512/nginx",
  "  tcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN      512/nginx",
  "  tcp        0      0 127.0.0.1:5432          0.0.0.0:*               LISTEN      884/postgres",
  "  tcp        0      0 127.0.0.1:3000          0.0.0.0:*               LISTEN      1204/node",
  "",
];

export const themes: Record<string, { bg: string; text: string; header: string; prompt: string; accent: string }> = {
  default: {
    bg: "bg-[hsl(0,0%,6%)]",
    text: "text-[hsl(0,0%,95%)]",
    header: "bg-[hsl(0,0%,12%)] border-border",
    prompt: "text-[hsl(142,70%,55%)]",
    accent: "text-[hsl(175,100%,50%)]",
  },
  matrix: {
    bg: "bg-[#050B05]",
    text: "text-[#00FF66]",
    header: "bg-[#0A160A] border-[#00FF66]/30",
    prompt: "text-[#00FF66] font-bold",
    accent: "text-[#33FF88]",
  },
  dracula: {
    bg: "bg-[#282a36]",
    text: "text-[#f8f8f2]",
    header: "bg-[#21222c] border-[#6272a4]",
    prompt: "text-[#50fa7b]",
    accent: "text-[#bd93f9]",
  },
  cyberpunk: {
    bg: "bg-[#0d0221]",
    text: "text-[#00f0ff]",
    header: "bg-[#190634] border-[#ff0055]",
    prompt: "text-[#ff0055]",
    accent: "text-[#ffe600]",
  },
  ubuntu: {
    bg: "bg-[#300a24]",
    text: "text-[#ffffff]",
    header: "bg-[#1e0517] border-[#4e1a3d]",
    prompt: "text-[#4e9a06]",
    accent: "text-[#e95420]",
  },
};
