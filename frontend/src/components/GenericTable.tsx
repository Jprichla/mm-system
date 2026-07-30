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
    return <div className="mm-empty-state">{vazioTexto}</div>;
  }

  return (
    <div className="mm-table-shell" role="region" aria-label={colunas.map((coluna) => coluna.titulo).join(', ')} tabIndex={0}>
      <table className="mm-table min-w-full border-collapse text-sm">
        <thead>
          <tr>
            {colunas.map((coluna) => (
              <th key={String(coluna.chave)} scope="col">
                {coluna.titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dados.map((item, idx) => (
            <tr key={(item.id as string | undefined) ?? idx}>
              {colunas.map((coluna) => (
                <td key={String(coluna.chave)}>
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
