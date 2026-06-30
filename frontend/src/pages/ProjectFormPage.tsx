import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '../contexts/ToastContext';
import type { Projeto } from '../types';
import { api } from '../services/api';
import { criarProjeto, atualizarProjeto } from '../services/projectsService';

export function ProjectFormPage() {
  const { id } = useParams();
  const edicao = Boolean(id);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { mostrarToast } = useToast();

  const [form, setForm] = useState<Partial<Projeto>>({
    code: '',
    name: '',
    description: '',
    status: 'ativo',
  });

  useEffect(() => {
    if (!id) return;
    api
      .get(`/projects/${id}`)
      .then((res) => setForm(res.data.dados as Projeto))
      .catch(() => mostrarToast('erro', t('erroPadrao')));
  }, [id, mostrarToast, t]);

  const salvar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    try {
      if (edicao) {
        await atualizarProjeto(id!, form);
      } else {
        await criarProjeto(form);
      }
      mostrarToast('sucesso', t('projetoCriado'));
      navigate('/projects');
    } catch (_erro) {
      mostrarToast('erro', t('erroPadrao'));
    }
  };

  return (
    <form className="space-y-4" onSubmit={salvar}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{edicao ? `${t('editar')} ${t('projetos')}` : t('novoProjeto')}</h2>
        <button className="mm-btn" type="button" onClick={() => navigate('/projects')}>
          {t('cancelar')}
        </button>
      </div>

      <section className="mm-card grid gap-3 p-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm">{t('codigo')}</label>
          <input className="mm-input" required value={form.code ?? ''} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
        </div>
        <div>
          <label className="mb-1 block text-sm">{t('nome')}</label>
          <input className="mm-input" required value={form.name ?? ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm">{t('descricao')}</label>
          <textarea className="mm-input" value={form.description ?? ''} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </div>
        <div>
          <label className="mb-1 block text-sm">{t('status')}</label>
          <select className="mm-input" value={form.status ?? 'ativo'} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Projeto['status'] }))}>
            <option value="ativo">ativo</option>
            <option value="revisao">revisao</option>
            <option value="encerrado">encerrado</option>
          </select>
        </div>
      </section>

      <button className="mm-btn mm-btn-primary" type="submit">
        {t('salvar')}
      </button>
    </form>
  );
}
