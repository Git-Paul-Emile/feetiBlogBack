type LogValue = string | number | boolean | null | undefined;
type LogFields = Readonly<Record<string, LogValue>>;

function writeLog(level: "info" | "error", event: string, fields: LogFields): void {
  const record = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...fields,
  };

  process.stdout.write(`${JSON.stringify(record)}\n`);
}

export const logger = {
  info(event: string, fields: LogFields = {}): void {
    writeLog("info", event, fields);
  },
  error(event: string, fields: LogFields = {}): void {
    writeLog("error", event, fields);
  },
};
