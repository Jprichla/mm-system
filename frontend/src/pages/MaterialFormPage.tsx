import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { criarMaterial, listarCategorias, atualizarMaterial } from '../services/materialsService';
import type { Categoria, Material } from '../types';
import { useToast } from '../contexts/ToastContext';

type AbaIdioma = 'pt' | 'en' | 'es';

export function MaterialFormPage() {
  const { id } = useParams();
  const edicao = Boolean(id);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { mostrarToast } = useToast();

  const [aba, setAba] = useState<AbaIdioma>('pt');
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [form, setForm] = useState<Partial<Material>>({
    code: '',
    categoryId: '',
    namePt: '',
    nameEn: '',
    nameEs: '',
    descriptionPt: '',
    descriptionEn: '',
    descriptionEs: '',
  });

  useEffect(() => {
    listarCategorias().then(setCategorias).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/materials/${id}`)
      .then((res) => setForm(res.data.dados as Material))
      .catch(() => mostrarToast('erro', t('erroPadrao')));
  }, [id, mostrarToast, t]);

  const salvar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    try {
      const resposta = edicao ? await atualizarMaterial(id!, form) : await criarMaterial(form);
      if (resposta.warning) {
        mostrarToast('erro', resposta.warning);
      }
      mostrarToast('sucesso', t('materialCriado'));
      navigate('/materials');
    } catch (_erro) {
      mostrarToast('erro', t('erroPadrao'));
    }
  };

  return (
    <form className="space-y-4" onSubmit={salvar}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{edicao ? `${t('editar')} ${t('materiais')}` : t('novoMaterial')}</h2>
        <button className="mm-btn" type="button" onClick={() => navigate('/materials')}>
          {t('cancelar')}
        </button>
      </div>

      <section className="mm-card grid gap-3 p-4 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm">{t('codigo')}</label>
          <input className="mm-input" required value={form.code ?? ''} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm">{t('categoria')}</label>
          <select className="mm-input" required value={form.categoryId ?? ''} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}>
            <option value="">Selecione</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.namePt}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="mm-card p-4">
        <div className="mb-3 flex gap-2">
          <button type="button" className={`mm-btn ${aba === 'pt' ? 'mm-btn-primary' : ''}`} onClick={() => setAba('pt')}>
            {t('abaPortugues')}
          </button>
          <button type="button" className={`mm-btn ${aba === 'en' ? 'mm-btn-primary' : ''}`} onClick={() => setAba('en')}>
            {t('abaIngles')}
          </button>
          <button type="button" className={`mm-btn ${aba === 'es' ? 'mm-btn-primary' : ''}`} onClick={() => setAba('es')}>
            {t('abaEspanhol')}
          </button>
        </div>

        {aba === 'pt' && (
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm">{t('nomePt')}</label>
              <input className="mm-input" required value={form.namePt ?? ''} onChange={(e) => setForm((f) => ({ ...f, namePt: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-sm">{t('descricaoPt')}</label>
              <textarea className="mm-input" value={form.descriptionPt ?? ''} onChange={(e) => setForm((f) => ({ ...f, descriptionPt: e.target.value }))} />
            </div>
          </div>
        )}

        {aba === 'en' && (
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm">{t('nomeEn')}</label>
              <input className="mm-input" value={form.nameEn ?? ''} onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-sm">{t('descricaoEn')}</label>
              <textarea className="mm-input" value={form.descriptionEn ?? ''} onChange={(e) => setForm((f) => ({ ...f, descriptionEn: e.target.value }))} />
            </div>
          </div>
        )}

        {aba === 'es' && (
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm">{t('nomeEs')}</label>
              <input className="mm-input" value={form.nameEs ?? ''} onChange={(e) => setForm((f) => ({ ...f, nameEs: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-sm">{t('descricaoEs')}</label>
              <textarea className="mm-input" value={form.descriptionEs ?? ''} onChange={(e) => setForm((f) => ({ ...f, descriptionEs: e.target.value }))} />
            </div>
          </div>
        )}
      </section>

      <button className="mm-btn mm-btn-primary" type="submit">
        {t('salvar')}
      </button>
    </form>
  );
}
