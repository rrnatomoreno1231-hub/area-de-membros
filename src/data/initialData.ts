import { Member, ModuleItem } from '../types/index.ts';

export const initialModules: ModuleItem[] = [
  {
    id: 'mod-1',
    title: 'Começe aqui',
    subtitle: 'Acesse todos os projetos e documentos de marcenaria',
    description: 'Guia completo com projetos detalhados em PDF para marcenaria, móveis em MDF, madeira maciça e pallets.',
    coverImage: '/modulo 1.jpg',
    order: 1,
    documents: [
      {
        id: 'doc-marcenaria-48',
        moduleId: 'mod-1',
        title: '+48 Projetos de Marcenaria',
        type: 'guide',
        description: 'Coletânea completa com mais de 48 projetos práticos e detalhados de marcenaria com medidas e instruções de montagem.',
        format: 'Documento em PDF',
        readTime: 'PDF Completo (66 páginas)',
        fileSize: '9.0 MB',
        downloadFileName: '+48 PROJETOS MARCENARIA.pdf',
        fileUrl: '/48-projetos-marcenaria.pdf',
        order: 1,
        keyTakeaways: [
          'Diagramas e cotas detalhadas para cortes precisos.',
          'Passo a passo com lista de materiais e peças necessárias.',
          'Arquivo pronto para visualização e impressão.'
        ],
        checklistItems: [
          { id: 'chk-m1', text: 'Baixar o PDF no computador ou celular' },
          { id: 'chk-m2', text: 'Escolher o primeiro projeto para executar' }
        ],
        resources: [
          { title: 'Baixar Arquivo PDF (+48 Projetos)', url: '/48-projetos-marcenaria.pdf', type: 'PDF' }
        ],
        contentMarkdown: `## +48 Projetos de Marcenaria

Este material reúne mais de 48 projetos práticos e estruturados para execução em marcenaria.

### O que você encontrará neste arquivo:
- Desenhos técnicos com vistas e medidas exatas.
- Especificações de corte e gabaritos.
- Orientações de montagem para iniciantes e profissionais.

Você pode ler o documento ou clicar no botão **Baixar Arquivo** para salvá-lo em seu computador ou celular.`
      },
      {
        id: 'doc-mdf-18',
        moduleId: 'mod-1',
        title: '18 Projetos de Marceneiro em MDF',
        type: 'guide',
        description: 'Projetos modernos com plano de corte e medidas ideais para chapas e estruturas em MDF.',
        format: 'Documento em PDF',
        readTime: 'PDF Completo',
        fileSize: '8.9 MB',
        downloadFileName: '18 projetos marceneiro MDF.pdf',
        fileUrl: '/18-projetos-marceneiro-mdf.pdf',
        order: 2,
        keyTakeaways: [
          'Projetos desenhados especificamente para chapas de MDF.',
          'Otimização do aproveitamento de corte para evitar desperdício de material.'
        ],
        checklistItems: [
          { id: 'chk-mdf-1', text: 'Revisar a espessura das chapas recomendadas (15mm ou 18mm)' },
          { id: 'chk-mdf-2', text: 'Preparar a fita de borda e ferragens indicadas' }
        ],
        resources: [
          { title: 'Baixar Arquivo PDF (18 Projetos MDF)', url: '/18-projetos-marceneiro-mdf.pdf', type: 'PDF' }
        ],
        contentMarkdown: `## 18 Projetos de Marceneiro em MDF

Guia focado na fabricação de peças modernas utilizando MDF.

### Principais Destaques:
- Projetos modulares para sala, quarto e escritório.
- Indicações de furação para corrediças, dobradiças e fixações invisíveis.`
      },
      {
        id: 'doc-armario-banheiro',
        moduleId: 'mod-1',
        title: 'Projeto: Armário de Banheiro',
        type: 'guide',
        description: 'Projeto detalhado para armário de banheiro com nichos, gavetas e acabamentos resistentes a umidade.',
        format: 'Documento em PDF',
        readTime: 'PDF Técnico',
        fileSize: '2.3 MB',
        downloadFileName: 'projeto armário de banheiro.pdf',
        fileUrl: '/projeto-armario-de-banheiro.pdf',
        order: 3,
        keyTakeaways: [
          'Medidas padronizadas e adaptáveis para bancadas e cubas.',
          'Detalhes de ventilação e proteção contra umidade.'
        ],
        checklistItems: [
          { id: 'chk-banh-1', text: 'Verificar medidas do espaço no banheiro' },
          { id: 'chk-banh-2', text: 'Conferir o ponto de saída de encanamento antes de cortar o fundo' }
        ],
        resources: [
          { title: 'Baixar Projeto do Armário de Banheiro', url: '/projeto-armario-de-banheiro.pdf', type: 'PDF' }
        ],
        contentMarkdown: `## Projeto: Armário de Banheiro

Projeto executivo passo a passo para fabricação de armário de banheiro sob medida.`
      },
      {
        id: 'doc-guarda-roupa',
        moduleId: 'mod-1',
        title: 'Projeto: Guarda-Roupa Detalhado',
        type: 'guide',
        description: 'Projeto completo de guarda-roupa com divisórias internas, cabideiros, gaveteiros e portas.',
        format: 'Documento em PDF',
        readTime: 'PDF Técnico',
        fileSize: '3.1 MB',
        downloadFileName: 'projeto guarda-roupa detalhado.pdf',
        fileUrl: '/projeto-guarda-roupa-detalhado.pdf',
        order: 4,
        keyTakeaways: [
          'Estruturação reforçada para sustentação de peso em prateleiras e gavetas.',
          'Plano de montagem em módulos independentes facilitando o transporte.'
        ],
        checklistItems: [
          { id: 'chk-gr-1', text: 'Conferir o pé-direito do ambiente e folgas de montagem' },
          { id: 'chk-gr-2', text: 'Nivelar a base antes de montar as laterais' }
        ],
        resources: [
          { title: 'Baixar Projeto Guarda-Roupa Detalhado', url: '/projeto-guarda-roupa-detalhado.pdf', type: 'PDF' }
        ],
        contentMarkdown: `## Projeto: Guarda-Roupa Detalhado

Projeto completo com todas as vistas, divisões internas e detalhes de ferragens para execução de guarda-roupa.`
      },
      {
        id: 'doc-madeira',
        moduleId: 'mod-1',
        title: 'Projetos em Madeira Maciça',
        type: 'guide',
        description: 'Projetos clássicos e rústicos utilizando madeira maciça, encaixes tradicionais e acabamentos refinados.',
        format: 'Documento em PDF',
        readTime: 'PDF Completo',
        fileSize: '2.7 MB',
        downloadFileName: 'Projetos em madeira.pdf',
        fileUrl: '/projetos-em-madeira.pdf',
        order: 5,
        keyTakeaways: [
          'Encaixes clássicos (espiga, meia-madeira e cavilhas).',
          'Técnicas de lixamento, selamento e aplicação de verniz ou óleo mineral.'
        ],
        checklistItems: [
          { id: 'chk-mad-1', text: 'Selecionar madeira seca e aparelhada' }
        ],
        resources: [
          { title: 'Baixar Projetos em Madeira', url: '/projetos-em-madeira.pdf', type: 'PDF' }
        ],
        contentMarkdown: `## Projetos em Madeira Maciça

Coletânea de projetos tradicionais com foco em durabilidade, encaixes clássicos e estética natural da madeira.`
      },
      {
        id: 'doc-pallet',
        moduleId: 'mod-1',
        title: 'Projetos de Móveis de Pallet',
        type: 'guide',
        description: 'Guia de sustentabilidade e marcenaria rústica com sofás, mesas de centro, bancos e estantes de pallets.',
        format: 'Documento em PDF',
        readTime: 'PDF Completo',
        fileSize: '4.6 MB',
        downloadFileName: 'projetos moveis de pallet.pdf',
        fileUrl: '/projetos-moveis-de-pallet.pdf',
        order: 6,
        keyTakeaways: [
          'Seleção e desmonte seguro de pallets.',
          'Tratamento da madeira, lixamento e proteção contra pragas.'
        ],
        checklistItems: [
          { id: 'chk-pal-1', text: 'Verificar se os pallets possuem tratamento térmico (HT)' }
        ],
        resources: [
          { title: 'Baixar Projetos Móveis de Pallet', url: '/projetos-moveis-de-pallet.pdf', type: 'PDF' }
        ],
        contentMarkdown: `## Projetos de Móveis de Pallet

Guia ilustrado de como transformar pallets em móveis criativos, funcionais e de baixo custo.`
      }
    ]
  },
  {
    id: 'mod-2',
    title: 'Bônus',
    subtitle: 'Materiais complementares e conteúdos exclusivos',
    description: 'Este módulo receberá materiais bônus adicionais em breve. Acompanhe as atualizações da área de membros.',
    coverImage: '/modulo 2.jpg',
    order: 2,
    documents: []
  }
];

export const initialMembers: Member[] = [
  {
    id: 'mem-admin-01',
    email: 'rrnatomoreno1231@gmail.com',
    name: 'Renato Moreno',
    phone: '+55 (11) 98765-4321',
    gateway: 'Kiwify',
    transactionId: 'KW-89214710',
    purchaseDate: '2026-09-28T14:30:00Z',
    status: 'active',
    completedDocumentIds: ['doc-marcenaria-48'],
    personalNotes: {},
    checklistProgress: {},
    lastLogin: '2026-10-06T08:15:00Z',
    role: 'admin'
  },
  {
    id: 'mem-02',
    email: 'carla.mendes@empresa.com.br',
    name: 'Carla Mendes',
    phone: '+55 (21) 99123-4567',
    gateway: 'Hotmart',
    transactionId: 'HP-90142851',
    purchaseDate: '2026-09-30T10:15:00Z',
    status: 'active',
    completedDocumentIds: [],
    personalNotes: {},
    lastLogin: '2026-10-06T16:00:00Z',
    role: 'member'
  }
];
