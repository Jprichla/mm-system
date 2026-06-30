interface Coluna<T> {
  chave: keyof T | string;
  titulo: string;
  render?: (item: T) => React.ReactNode;
}

interface GenericTableProps<T> {
  dados: T[];
  colunas: Coluna<T>[];
  vazioTexto: string;
}

export function GenericTable<T extends { id?: string }>({ dados, colunas, vazioTexto }: GenericTableProps<T>) {
  if (!dados.length) {
    return <div className="mm-card p-4 text-sm opacity-80">{vazioTexto}</div>;
  }

  return (
    <div className="mm-card overflow-x-auto">
      <table className="min-w-full border-collapse text-sm">
        <thead style={{ background: 'var(--header-bg)', color: 'var(--header-text)' }}>
          <tr>
            {colunas.map((coluna) => (
              <th key={String(coluna.chave)} className="px-3 py-2 text-left font-semibold">
                {coluna.titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dados.map((item, idx) => (
            <tr key={(item.id as string | undefined) ?? idx} className="border-b" style={{ borderColor: 'var(--border)' }}>
              {colunas.map((coluna) => (
                <td key={String(coluna.chave)} className="px-3 py-2 align-top">
                  {coluna.render ? coluna.render(item) : String((item as Record<string, unknown>)[coluna.chave as string] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
