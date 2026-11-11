import type { ReactNode } from "react";

interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  emptyTitle?: string;
  emptyText?: string;
}

export default function DataTable<T>({
  columns,
  data,
  keyField,
  emptyTitle = "Aucune donnée",
  emptyText,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="mt-6 rounded-lg border border-dashed border-outline-variant p-10 text-center">
        <p className="font-semibold text-primary">{emptyTitle}</p>
        {emptyText && <p className="mt-1 text-body-sm text-on-surface-variant">{emptyText}</p>}
      </div>
    );
  }
  return (
    <div className="mt-6 overflow-x-auto rounded-lg border border-outline-variant/50">
      <table className="w-full min-w-[720px] text-left text-body-sm">
        <thead className="bg-surface-container-low text-label-sm uppercase tracking-wider text-on-surface-variant">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={`px-4 py-3 font-semibold ${c.className ?? ""}`}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-container-high bg-surface-container-lowest">
          {data.map((row) => (
            <tr
              key={String(row[keyField])}
              className="transition-colors hover:bg-surface-container-low"
            >
              {columns.map((c) => (
                <td key={c.key} className="px-4 py-3">
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
