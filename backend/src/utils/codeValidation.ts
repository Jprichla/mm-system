const PADRAO_MATERIAL_PAI = /^[A-Z]{2}\.[A-Z]{2}$/;
const PADRAO_VARIANTE = /^[A-Z]{2}\.[A-Z]{2}\d{2}\.[A-Z]{2}$/;

export function validarCodigoMaterialPai(codigo: string): string | null {
  if (!PADRAO_MATERIAL_PAI.test(codigo)) {
    return 'Código fora do padrão esperado para material pai (XX.XX). O cadastro será permitido com alerta.';
  }
  return null;
}

export function validarCodigoVariante(codigo: string): string | null {
  if (!PADRAO_VARIANTE.test(codigo)) {
    return 'Código fora do padrão esperado para variante (XX.XXNN.XX). O cadastro será permitido com alerta.';
  }
  return null;
}
