import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import type { Role } from '../types';

const ROLE_OPTIONS: Array<{ value: Role; labelKey: string }> = [
  { value: 'admin', labelKey: 'roleAdmin' },
  { value: 'gestor', labelKey: 'roleGestor' },
  { value: 'engenheiro', labelKey: 'roleEngenheiro' },
  { value: 'usuario', labelKey: 'roleUsuario' },
  { value: 'cliente', labelKey: 'roleCliente' },
];

interface RolePreviewControlProps {
  variant: 'desktop' | 'mobile';
}

export function RolePreviewControl({ variant }: RolePreviewControlProps) {
  const { t } = useTranslation();
  const isAdminReal = useAuthStore((state) => state.isAdminReal);
  const roleEfetivo = useAuthStore((state) => state.roleEfetivo);
  const definirRoleVisualizado = useAuthStore((state) => state.definirRoleVisualizado);
  const selectId = `role-preview-${variant}`;

  if (!isAdminReal) {
    return null;
  }

  return (
    <div
      className={`mm-role-preview-control mm-role-preview-control--${variant}${
        variant === 'desktop' ? ' mm-role-preview-control--desktop-capsule' : ''
      }`}
    >
      <label className={variant === 'desktop' ? 'sr-only' : undefined} htmlFor={selectId}>
        {t('visualizarComo')}
      </label>
      <span className="mm-role-preview-control__desktop-prefix" aria-hidden="true">
        {t('visualizarComo')}:
      </span>
      <select
        id={selectId}
        value={roleEfetivo}
        onChange={(event) => definirRoleVisualizado(event.target.value as Role)}
      >
        {ROLE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {t(option.labelKey)}
          </option>
        ))}
      </select>
    </div>
  );
}
