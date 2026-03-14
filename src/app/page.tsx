'use client'

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation'; // Ajustado para Next.js
import { Trash2, Pencil, AlertTriangle, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';

interface ItemEstoque {
  id: string;
  nome: string;
  quantidade_atual: number;
  unidade_medida: string;
  estoque_minimo: number;
}

export default function Home() {
  const [itens, setItens] = useState<ItemEstoque[]>([]);
  const [mounted, setMounted] = useState(false);
  const router = useRouter(); // Hook correto do Next.js

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    (async () => {
      const { data, error } = await supabase.from('itens_estoque').select('*').order('nome');
      if (data) setItens(data as ItemEstoque[]);
      if (error) console.error(error.message);
    })();
    return () => clearTimeout(timer);
  }, []);

  const alterarQuantidade = async (id: string, novaQuantidade: number) => {
    if (novaQuantidade < 0) return;
    const { error } = await supabase.from('itens_estoque').update({ quantidade_atual: novaQuantidade }).eq('id', id);
    if (!error) {
      setItens(prev => prev.map(item => item.id === id ? { ...item, quantidade_atual: novaQuantidade } : item));
    }
  };

  const deletarItem = async (id: string, nome: string) => {
    if (!confirm(`Apagar "${nome}"?`)) return;
    const { error } = await supabase.from('itens_estoque').delete().eq('id', id);
    if (!error) setItens(prev => prev.filter(item => item.id !== id));
  };

  if (!mounted) return null;

  return (
    <main className="max-w-md mx-auto min-h-screen bg-background pb-32 antialiased">
      {/* Header Estilo iOS com Blur */}
      <header className="px-6 pt-12 pb-6 sticky top-0 bg-background/80 backdrop-blur-md z-40 border-b border-transparent">
        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em] mb-1">
          Saborosa Refeição
        </p>
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Estoque</h1>
      </header>

      <section className="px-4 space-y-4">
        {itens.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg italic">Dispensa vazia...</p>
            <p className="text-muted-foreground text-sm mt-1">Toque no + para começar</p>
          </div>
        )}

        {itens.map((item) => {
          const critico = item.quantidade_atual <= item.estoque_minimo;
          return (
            <div
              key={item.id}
              className="bg-card rounded-3xl p-5 shadow-sm border border-border transition-all active:scale-[0.98]"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  {critico && (
                    <span className="flex items-center gap-1 text-[10px] font-black text-destructive uppercase tracking-widest mb-1">
                      <AlertTriangle size={12} /> Crítico
                    </span>
                  )}
                  <h2 className="font-bold text-xl text-card-foreground tracking-tight uppercase leading-none">
                    {item.nome}
                  </h2>
                  <p className={`text-2xl font-black tracking-tighter ${critico ? 'text-destructive' : 'text-primary'}`}>
                    {item.quantidade_atual}{' '}
                    <span className="text-xs font-medium text-muted-foreground uppercase">
                      {item.unidade_medida}
                    </span>
                  </p>
                </div>
                
                {/* Ações: Editar e Deletar */}
                <div className="flex gap-1">
                  <Button
                    variant="cupertino-icon"
                    size="icon-sm"
                    onClick={() => router.push(`/editar/${item.id}`)}
                  >
                    <Pencil size={18} />
                  </Button>
                  <Button
                    variant="cupertino-danger"
                    size="icon-sm"
                    onClick={() => deletarItem(item.id, item.nome)}
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>

              {/* Botões de Controle estilo Apple */}
              <div className="flex items-center gap-3">
                <Button
                  variant="cupertino-secondary"
                  size="stepper"
                  onClick={() => alterarQuantidade(item.id, item.quantidade_atual - 1)}
                >
                  −
                </Button>
                <Button
                  variant="cupertino"
                  size="stepper"
                  onClick={() => alterarQuantidade(item.id, item.quantidade_atual + 1)}
                >
                  +
                </Button>
              </div>
            </div>
          );
        })}
      </section>

      {/* Botão de Adicionar (FAB) */}
      <Button
        variant="fab"
        size="fab"
        className="fixed bottom-10 right-6 z-50 shadow-2xl border-4 border-background"
        onClick={() => router.push('/novo')}
      >
        <Plus size={32} strokeWidth={3} />
      </Button>
    </main>
  );
}