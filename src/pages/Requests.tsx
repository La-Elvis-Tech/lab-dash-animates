import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ExamsStats from '@/components/exams/ExamsStats';
import ExamDetailsCard from '@/components/exams/ExamDetailsCard';
import { examDetailsService } from '@/services/examDetailsService';
import { ExamDetails, ExamMaterial } from '@/types/examDetails';
import { Skeleton } from "@/components/ui/skeleton";

// Add a local Unit interface for illustrative purposes
interface Unit {
  id: string;
  name: string;
}

// Extend ExamDetails to support 'unit' just for display purposes in this UI
interface ExamDetailsWithUnit extends ExamDetails {
  unit?: Unit;
}

// Mock para simulação: associar exames a unidades distintas (exemplo local)
const mockUnits: Unit[] = [
  { id: 'un-a', name: 'Unidade Central' },
  { id: 'un-b', name: 'Unidade Norte' },
  { id: 'un-c', name: 'Unidade Zona Sul' },
];

const mockExams: ExamDetailsWithUnit[] = [
  {
    id: 'e1',
    name: 'Hemograma Completo',
    description: 'Avaliação geral do sangue.',
    category: 'Hematologia',
    cost: 57.2,
    total_material_cost: 21.3,
    duration_minutes: 25,
    materials_available: true,
    materials: [
      {
        inventory_item_id: 'mat-1',
        item_name: 'Tubo EDTA',
        quantity_required: 1,
        current_stock: 20,
        reserved_stock: 0,
        available_stock: 20,
        sufficient_stock: true,
        estimated_cost: 4.1,
        material_type: 'consumable',
      },
    ],
    preparation: { requires_preparation: false },
    unit: mockUnits[0],
  },
  {
    id: 'e2',
    name: 'Ultrassom Obstétrico',
    description: 'Exame de imagem do útero e bebê.',
    category: 'Imagem',
    cost: 180,
    total_material_cost: 30,
    duration_minutes: 35,
    materials_available: true,
    materials: [
      {
        inventory_item_id: 'mat-2',
        item_name: 'Gel condutor',
        quantity_required: 1,
        current_stock: 12,
        reserved_stock: 1,
        available_stock: 11,
        sufficient_stock: true,
        estimated_cost: 2.5,
        material_type: 'consumable',
      },
    ],
    preparation: { requires_preparation: true, preparation_instructions: 'Beber 1L de água.' },
    unit: mockUnits[1],
  },
  {
    id: 'e3',
    name: 'Eletrocardiograma',
    description: 'Registra atividade elétrica do coração.',
    category: 'Cardiologia',
    cost: 80,
    total_material_cost: 18,
    duration_minutes: 18,
    materials_available: false,
    materials: [
      {
        inventory_item_id: 'mat-3',
        item_name: 'Eletrodo adesivo',
        quantity_required: 5,
        current_stock: 4,
        reserved_stock: 0,
        available_stock: 4,
        sufficient_stock: false,
        estimated_cost: 7,
        material_type: 'consumable',
      },
    ],
    preparation: { requires_preparation: false },
    unit: mockUnits[2],
  },
  // More mock exams (with unique units) for illustration:
  {
    id: 'e4',
    name: 'Tomografia',
    description: 'Exame detalhado de imagens por cortes.',
    category: 'Imagem',
    cost: 320,
    total_material_cost: 54,
    duration_minutes: 40,
    materials_available: true,
    materials: [
      {
        inventory_item_id: 'mat-4',
        item_name: 'Contraste',
        quantity_required: 1,
        current_stock: 10,
        reserved_stock: 0,
        available_stock: 10,
        sufficient_stock: true,
        estimated_cost: 20,
        material_type: 'consumable',
      },
      {
        inventory_item_id: 'mat-5',
        item_name: 'Seringa',
        quantity_required: 1,
        current_stock: 30,
        reserved_stock: 0,
        available_stock: 30,
        sufficient_stock: true,
        estimated_cost: 4,
        material_type: 'consumable',
      },
    ],
    preparation: { requires_preparation: true, preparation_instructions: 'Jejum de 8h.' },
    unit: { id: 'un-d', name: 'Unidade Leste' },
  },
  {
    id: 'e5',
    name: 'Raio-X de Tórax',
    description: 'Radiografia do tórax.',
    category: 'Imagem',
    cost: 90,
    total_material_cost: 14,
    duration_minutes: 20,
    materials_available: true,
    materials: [
      {
        inventory_item_id: 'mat-6',
        item_name: 'Chassi de Raio-X',
        quantity_required: 1,
        current_stock: 2,
        reserved_stock: 1,
        available_stock: 1,
        sufficient_stock: true,
        estimated_cost: 10,
        material_type: 'permanent',
      },
      {
        inventory_item_id: 'mat-7',
        item_name: 'Filme Radiográfico',
        quantity_required: 1,
        current_stock: 50,
        reserved_stock: 0,
        available_stock: 50,
        sufficient_stock: true,
        estimated_cost: 4,
        material_type: 'consumable',
      },
    ],
    preparation: { requires_preparation: false },
    unit: { id: 'un-b', name: 'Unidade Norte' },
  },
];

// Componente skeleton para o card dos exames (use o mesmo layout do ExamDetailsCard, mas só skeletons)
function ExamDetailsCardSkeleton() {
  return (
    <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 h-full flex flex-col">
      <div className="pb-4 border-b border-neutral-100 dark:border-neutral-700">
        <div className="flex justify-between items-start px-6 pt-6">
          <div>
            <Skeleton className="h-5 w-36 mb-2" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="text-right">
            <Skeleton className="h-5 w-16 mb-2" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </div>
      <CardContent className="flex-1 space-y-5 flex flex-col justify-between px-6 py-4">
        <div className="overflow-auto max-h-[160px] space-y-4">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/6" />
          <Skeleton className="h-3 w-2/5" />
        </div>
        <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

const Requests = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('all');
  // Use ExamDetailsWithUnit as our internal working type
  const [examDetailsList, setExamDetailsList] = useState<ExamDetailsWithUnit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscribed = true;
    setLoading(true);

    import('@/services/examDetailsService').then((svc) => {
      svc.examDetailsService.getAllExamsWithMaterials().then((exams) => {
        // Just attempt to assign a mock unit to each
        const withUnit: ExamDetailsWithUnit[] = 
          exams.map((e, idx) => ({
            ...e,
            unit: mockUnits[idx % mockUnits.length],
          })) as ExamDetailsWithUnit[];

        if (subscribed) {
          setExamDetailsList(withUnit.length ? withUnit : mockExams);
          setLoading(false);
        }
      }).catch(() => {
        setExamDetailsList(mockExams);
        setLoading(false);
      });
    });
    return () => { subscribed = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        {/* Loader aqui pode ser customizado conforme desejado */}
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 relative mb-2">
            <span className="absolute inset-0 rounded-full border-4 border-blue-400 border-r-transparent animate-spin" />
            <span className="relative z-10 block w-4 h-4 bg-blue-500/90 rounded-full animate-pulse" />
          </div>
          <p className="text-blue-500 font-medium">Carregando exames...</p>
        </div>
      </div>
    );
  }

  if (!Array.isArray(examDetailsList) || examDetailsList.length === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <span className="text-gray-500">Nenhum exame cadastrado.</span>
      </div>
    );
  }

  // Pegue todas as unidades únicas presentes nos exames
  const allUnits = [
    { id: 'all', name: 'Todas as unidades', count: examDetailsList.length },
    ...Array.from(
      // Map para garantir unicidade por id
      examDetailsList
        .map(e => e.unit)
        .filter((u): u is Unit => !!u)
        .reduce((acc, unit) => {
          if (unit && !acc.has(unit.id)) acc.set(unit.id, unit);
          return acc;
        }, new Map<string, Unit>())
        .values()
    ).map((unit) => ({
      id: unit.id,
      name: unit.name,
      count: examDetailsList.filter(e => e.unit?.id === unit.id).length,
    }))
  ];

  const filteredExams = examDetailsList.filter((exam) => {
    const matchesSearch =
      exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exam.description && exam.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesUnit = selectedUnit === 'all' || exam.unit?.id === selectedUnit;
    return matchesSearch && matchesUnit;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Tipos de Exames</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Gerencie os tipos de exames disponíveis no laboratório
        </p>
      </div>
      <div className="flex flex-col md:flex-row gap-2 items-center justify-between">
        <div className="relative w-full md:max-w-xs">
          <input
            placeholder="Buscar exame..."
            className="pl-8 pr-3 py-2 w-full rounded-md border bg-white dark:bg-neutral-800"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-2 top-2.5 text-blue-400">
            <Search size={18} />
          </span>
        </div>
        <select
          value={selectedUnit}
          onChange={e => setSelectedUnit(e.target.value)}
          className="rounded-md border px-3 py-2 bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-100 min-w-[180px]"
        >
          {allUnits.map(unit => (
            <option key={unit.id} value={unit.id}>
              {unit.name} ({unit.count})
            </option>
          ))}
        </select>
      </div>
      {/* Uniform grid for exam cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? [...Array(6)].map((_, idx) => (
              <div key={idx} className="h-full flex flex-col" style={{ minHeight: '430px', maxHeight: '430px' }}>
                <ExamDetailsCardSkeleton />
                <div className="mt-1 text-xs text-neutral-600 dark:text-neutral-400 italic text-right">
                  <Skeleton className="h-3 w-24 inline-block" />
                </div>
              </div>
            ))
          : filteredExams.length > 0
            ? filteredExams.map((exam) => (
                <div
                  key={exam.id}
                  className="h-full flex flex-col"
                  style={{ minHeight: '430px', maxHeight: '430px' }}
                >
                  {/* Card central é sempre do mesmo tamanho, conteúdo dentro pode ser scrollável */}
                  <div className="flex-grow flex flex-col">
                    <div className="overflow-auto max-h-[310px]">
                      <ExamDetailsCard
                        exam={exam}
                        onSchedule={() => { console.log('Agendar exame:', exam.name); }}
                      />
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-neutral-600 dark:text-neutral-400 italic text-right">
                    Unidade: <span className="font-medium not-italic">{exam.unit?.name || 'N/A'}</span>
                  </div>
                </div>
              ))
            : (
                <div className="col-span-full text-center py-10">
                  <p className="text-gray-500 dark:text-gray-400">Nenhum exame encontrado com os filtros aplicados.</p>
                </div>
              )
        }
      </div>
    </div>
  );
};
export default Requests;
