type DbError = { code?: string; message?: string } | null;
type Result<T> = { data: T; error: DbError };
const optionalColumns = new Set(["priority", "due_date", "due_time", "reminder_at", "reminder_sent_at"]);

// Older projects may not have the optional todo/reminder migration yet.
// Retry only explicit missing optional columns; never retry auth or network failures.
export async function writeEntry<T>(payload: Record<string, unknown>, write: (values: Record<string, unknown>) => PromiseLike<Result<T>>): Promise<Result<T>> {
  const values = { ...payload };
  for (;;) {
    const result = await write(values);
    const error = result.error;
    if (!error || !["42703", "PGRST204"].includes(error.code ?? "")) return result;
    const column = error.message?.match(/column (?:entries\.)?([a-z_]+) does not exist/i)?.[1]
      ?? error.message?.match(/Could not find the '([a-z_]+)' column/i)?.[1];
    if (!column || !optionalColumns.has(column) || !(column in values)) return result;
    delete values[column];
  }
}
