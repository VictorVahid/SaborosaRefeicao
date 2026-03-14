'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import { useRouter, useParams } from 'next/navigation'; // Next.js hooks
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

export default function EditarItem() {
  const router = useRouter();
  const params = useParams(); // Pega o [id] da URL
  
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [unidade, setUnidade] = useState('');
  const [minimo, setMinimo] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Carregar os dados atuais do item
  useEffect(() => {
    if (!params.id) return;
    
    (async () => {
      const { data, error } = await supabase
        .from('itens_estoque')
        .select('*')
        .eq('id', params.id)
        .single();
      if (error) {
        console.error('Erro ao buscar item:', error.message);
        setFetching(false);
        return;
      }
      if (data) {
        setNome(data.nome);
        setQuantidade(String(data.quantidade_atual));
        setUnidade(data.unidade_medida);
        setMinimo(String(data.estoque_minimo));
      }
      
      setFetching(false);
    })();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !params.id) return;
    setLoading(true);

    const { error } = await supabase
      .from('itens_estoque')
      .update({
        nome: nome.trim(),
        quantidade_atual: Number(quantidade) || 0,
        unidade_medida: unidade.trim() || 'un',
        estoque_minimo: Number(minimo) || 0,
      })
      .eq('id', params.id);

    setLoading(false);
    if (!error) router.push('/');
  };

  if (fetching) return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <p className="text-muted-foreground animate-pulse">Buscando dados do item...</p>
    </div>
  );

  return (
    <main className="max-w-md mx-auto min-h-screen bg-background antialiased">
      {/* Header Estilo iOS */}
      <header className="px-6 pt-12 pb-6 sticky top-0 bg-background/80 backdrop-blur-md z-40 border-b border-transparent">
        <button 
          onClick={() => router.push('/')} 
          className="flex items-center gap-1 text-primary text-sm font-semibold mb-3 active:opacity-50 transition-opacity"
        >
          <ChevronLeft size={20} strokeWidth={3} /> Voltar
        </button>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Editar Item</h1>
        <p className="text-muted-foreground text-xs">Alterando: {nome}</p>
      </header>

      <form onSubmit={handleSubmit} className="px-6 space-y-6">
        {/* Campo Nome */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
            Nome do item
          </label>
          <input 
            required
            id="nome" 
            value={nome} 
            onChange={e => setNome(e.target.value)} 
            placeholder="Ex: Arroz" 
            className="w-full h-14 px-4 rounded-2xl bg-card border border-border focus:ring-2 focus:ring-primary outline-none text-foreground transition-all" 
          />
        </div>

        {/* Quantidade e Unidade */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
              Quantidade
            </label>
            <input 
              required
              id="quantidade" 
              type="number" 
              value={quantidade} 
              onChange={e => setQuantidade(e.target.value)} 
              placeholder="0" 
              className="w-full h-14 px-4 rounded-2xl bg-card border border-border focus:ring-2 focus:ring-primary outline-none text-foreground transition-all" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
              Unidade
            </label>
            <input 
              required
              id="unidade" 
              value={unidade} 
              onChange={e => setUnidade(e.target.value)} 
              placeholder="Kg, Un..." 
              className="w-full h-14 px-4 rounded-2xl bg-card border border-border focus:ring-2 focus:ring-primary outline-none text-foreground transition-all" 
            />
          </div>
        </div>

        {/* Estoque Mínimo */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
            Estoque Mínimo (Alerta)
          </label>
          <input 
            required
            id="minimo" 
            type="number" 
            value={minimo} 
            onChange={e => setMinimo(e.target.value)} 
            placeholder="0" 
            className="w-full h-14 px-4 rounded-2xl bg-card border border-border focus:ring-2 focus:ring-primary outline-none text-foreground transition-all" 
          />
        </div>

        {/* Botão Salvar Estilo Cupertino */}
        <Button 
          variant="cupertino" 
          size="stepper" 
          className="w-full mt-6 h-16 shadow-xl" 
          type="submit" 
          disabled={loading}
        >
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </form>
    </main>
  );
}