import { useEffect, useRef, useState } from 'react';
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
  const tabRefs = useRef<Record<AbaIdioma, HTMLButtonElement | null>>({ pt: null, en: null, es: null });
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [form, setForm] = useState<Partial<Material>>({
    code: '', categoryId: '', namePt: '', nameEn: '', nameEs: '', descriptionPt: '', descriptionEn: '', descriptionEs: '',
  });

  useEffect(() => { listarCategorias().then(setCategorias).catch(() => undefined); }, []);

  useEffect(() => {
    if (!id) return;
    api.get(`/materials/${id}`)
      .then((res) => setForm(res.data.dados as Material))
      .catch(() => mostrarToast('erro', t('erroPadrao')));
  }, [id, mostrarToast, t]);

  const salvar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    try {
      const resposta = edicao ? await atualizarMaterial(id!, form) : await criarMaterial(form);
      if (resposta.warning) mostrarToast('erro', resposta.warning);
      mostrarToast('sucesso', t('materialCriado'));
      navigate('/materials');
    } catch (_erro) {
      mostrarToast('erro', t('erroPadrao'));
    }
  };

  const idiomas: Array<{ id: AbaIdioma; label: string }> = [
    { id: 'pt', label: t('abaPortugues') },
    { id: 'en', label: t('abaIngles') },
    { id: 'es', label: t('abaEspanhol') },
  ];

  const navegarAbas = (evento: React.KeyboardEvent<HTMLButtonElement>, atual: AbaIdioma) => {
    const indiceAtual = idiomas.findIndex((idioma) => idioma.id === atual);
    const proximoIndice = evento.key === 'ArrowRight' ? (indiceAtual + 1) % idiomas.length
      : evento.key === 'ArrowLeft' ? (indiceAtual - 1 + idiomas.length) % idiomas.length
        : evento.key === 'Home' ? 0 : evento.key === 'End' ? idiomas.length - 1 : -1;
    if (proximoIndice < 0) return;
    evento.preventDefault();
    const proximaAba = idiomas[proximoIndice].id;
    setAba(proximaAba);
    tabRefs.current[proximaAba]?.focus();
  };

  return (
    <form className="space-y-5" onSubmit={salvar}>
      <div className="mm-page-header">
        <div>
          <h1 className="text-2xl font-bold">{edicao ? `${t('editar')} ${t('materiais')}` : t('novoMaterial')}</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{t('codigo')} {t('categoria').toLowerCase()}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="mm-btn" type="button" onClick={() => navigate('/materials')}>{t('cancelar')}</button>
          <button className="mm-btn mm-btn-primary" type="submit">{t('salvar')}</button>
        </div>
      </div>

      <section className="mm-card mm-section-card">
        <h2 className="mm-section-heading">{t('informacoesGerais')}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="mm-field">
            <span>{t('codigo')}</span>
            <input className="mm-input" required value={form.code ?? ''} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} />
          </label>
          <label className="mm-field md:col-span-2">
            <span>{t('categoria')}</span>
            <select className="mm-input" required value={form.categoryId ?? ''} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}>
              <option value="">Selecione</option>
              {categorias.map((cat) => <option key={cat.id} value={cat.id}>{cat.namePt}</option>)}
            </select>
          </label>
        </div>
      </section>

      <section className="mm-card mm-section-card">
        <div>
          <h2 className="mm-section-heading">{t('nomes')} e {t('descricoes')}</h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{t('abaPortugues')}, {t('abaIngles')} e {t('abaEspanhol')}</p>
        </div>
        <div className="mm-tabs" role="tablist" aria-label={t('nomes')}>
          {idiomas.map((idioma) => (
            <button key={idioma.id} ref={(elemento) => { tabRefs.current[idioma.id] = elemento; }} id={`material-tab-${idioma.id}`} className="mm-tab" type="button" role="tab" tabIndex={aba === idioma.id ? 0 : -1} aria-selected={aba === idioma.id} aria-controls={`material-panel-${idioma.id}`} onClick={() => setAba(idioma.id)} onKeyDown={(evento) => navegarAbas(evento, idioma.id)}>
              {idioma.label}
            </button>
          ))}
        </div>
        <div id="material-panel-pt" role="tabpanel" aria-labelledby="material-tab-pt" hidden={aba !== 'pt'} className="grid gap-4 md:grid-cols-2"><label className="mm-field"><span>{t('nomePt')}</span><input className="mm-input" required={aba === 'pt'} value={form.namePt ?? ''} onChange={(e) => setForm((f) => ({ ...f, namePt: e.target.value }))} /></label><label className="mm-field"><span>{t('descricaoPt')}</span><textarea className="mm-input" value={form.descriptionPt ?? ''} onChange={(e) => setForm((f) => ({ ...f, descriptionPt: e.target.value }))} /></label></div>
        <div id="material-panel-en" role="tabpanel" aria-labelledby="material-tab-en" hidden={aba !== 'en'} className="grid gap-4 md:grid-cols-2"><label className="mm-field"><span>{t('nomeEn')}</span><input className="mm-input" value={form.nameEn ?? ''} onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))} /></label><label className="mm-field"><span>{t('descricaoEn')}</span><textarea className="mm-input" value={form.descriptionEn ?? ''} onChange={(e) => setForm((f) => ({ ...f, descriptionEn: e.target.value }))} /></label></div>
        <div id="material-panel-es" role="tabpanel" aria-labelledby="material-tab-es" hidden={aba !== 'es'} className="grid gap-4 md:grid-cols-2"><label className="mm-field"><span>{t('nomeEs')}</span><input className="mm-input" value={form.nameEs ?? ''} onChange={(e) => setForm((f) => ({ ...f, nameEs: e.target.value }))} /></label><label className="mm-field"><span>{t('descricaoEs')}</span><textarea className="mm-input" value={form.descriptionEs ?? ''} onChange={(e) => setForm((f) => ({ ...f, descriptionEs: e.target.value }))} /></label></div>
      </section>
    </form>
  );
}
