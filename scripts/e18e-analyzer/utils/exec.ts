export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export async function execAsync(
  cmd: string,
  args: string[],
): Promise<ExecResult> {
  const proc = Bun.spawn([cmd, ...args], { stdout: "pipe", stderr: "pipe" });
  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  const exitCode = await proc.exited;
  return { stdout, stderr, exitCode };
}
